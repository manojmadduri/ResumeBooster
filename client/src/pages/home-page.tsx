import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChangeEvent } from "react";
import {
  readDocumentFile,
  availableFonts,
  type DocumentContent,
  downloadDocument,
} from "@/lib/document-utils";
import { saveAs } from "file-saver"; // Import saveAs

const resumeSchema = z.object({
  content: z.string().min(1, "Resume content is required"),
  jobDescription: z.string().min(1, "Job description is required"),
  requirements: z.string(),
  preserveFormat: z.boolean().default(true),
  selectedSection: z
    .enum(["all", "summary", "experience", "projects", "skills"])
    .default("all"),
  selectedFont: z.string().optional(),
  documentFormat: z.enum(["txt", "docx", "pdf"]).default("txt"),
  originalBuffer: z.any().optional(),
  contentHtml: z.string().optional(),
});

type ResumeFormData = z.infer<typeof resumeSchema>;

import { ThemeToggle } from "@/components/theme-toggle";
import { FileText } from "lucide-react";

//Added Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-200 py-4 text-center">
      <p>&copy; 2023 Resume Tailor. Created by @manojkakashi</p>
    </footer>
  );
};

//Added Pricing and Contact Pages (placeholders)

const PricingPage = () => {
  return (
    <div>
      <h1>Pricing Page</h1>
      <p>Pricing information will go here.</p>
    </div>
  );
};

const ContactPage = () => {
  return (
    <div>
      <h1>Contact Page</h1>
      <p>Contact information will go here.</p>
    </div>
  );
};

import { createBrowserRouter, RouterProvider } from "react-router-dom";
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/pricing",
    element: <PricingPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
]);

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      content: "",
      jobDescription: "",
      requirements: "",
      preserveFormat: true,
      selectedSection: "all",
      documentFormat: "txt",
    },
  });

  const tailorResumeMutation = useMutation({
    mutationFn: async (data: ResumeFormData) => {
      const res = await apiRequest("POST", "/api/tailor-resume", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Resume has been tailored successfully",
      });
      form.setValue("content", data.content);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length) {
      const file = files[0];
      await processFile(file);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    try {
      const result = await readDocumentFile(file);
      form.setValue("content", result.content);
      form.setValue("documentFormat", result.format);
      form.setValue("originalBuffer", result.buffer);

      if (result.html) {
        form.setValue("contentHtml", result.html);
      }

      toast({
        title: "Success",
        description: `File uploaded successfully in ${result.format.toUpperCase()} format`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (
    content: string,
    format: string,
    originalBuffer: ArrayBuffer | undefined,
  ) => {
    try {
      const preserveFormat = form.watch("preserveFormat");
      await downloadDocument(content, format, originalBuffer, preserveFormat);
      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Error",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Resume Tailor</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Welcome, {user?.username}
            </span>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="font-medium"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) =>
                      tailorResumeMutation.mutate(data),
                    )}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload Your Resume</FormLabel>
                          <FormControl>
                            <div
                              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary cursor-pointer transition-colors"
                              onDragOver={handleDragOver}
                              onDrop={handleDrop}
                              onClick={() =>
                                document.getElementById("fileInput")?.click()
                              }
                            >
                              <input
                                id="fileInput"
                                type="file"
                                accept=".txt,.doc,.docx,.pdf"
                                className="hidden"
                                onChange={handleFileSelect}
                              />
                              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <p>
                                Drag and drop your resume file here, or click to
                                select
                              </p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Supported formats: PDF, DOC, DOCX, TXT
                              </p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="selectedSection"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Section to Update</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select section" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">
                                  Entire Resume
                                </SelectItem>
                                <SelectItem value="summary">Summary</SelectItem>
                                <SelectItem value="experience">
                                  Experience
                                </SelectItem>
                                <SelectItem value="projects">
                                  Projects
                                </SelectItem>
                                <SelectItem value="skills">Skills</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="selectedFont"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Font Style</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select font" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableFonts.map((font) => (
                                  <SelectItem
                                    key={font.value}
                                    value={font.value}
                                  >
                                    {font.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="jobDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Senior Software Engineer"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jobDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Paste the full job description here"
                              className="h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requirements (one per line)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="- 5+ years of experience
- Bachelor's degree
- Strong communication skills"
                              className="h-[120px] font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preserveFormat"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">
                            Preserve original format
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={tailorResumeMutation.isPending}
                    >
                      {tailorResumeMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Analyze and Tailor Resume
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Resume Preview</h2>
                  {form.watch("content") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        const content = form.getValues("content");
                        const format = form.getValues("documentFormat");
                        const originalBuffer = form.getValues("originalBuffer");

                        handleDownload(content, format, originalBuffer);
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
                {form.watch("content") ? (
                  <div
                    className={`bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[600px] ${
                      form.watch("selectedFont")
                        ? `font-${form.watch("selectedFont")}`
                        : ""
                    }`}
                  >
                    {form.watch("content")}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    Upload a resume to get started
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer /> {/* Added Footer */}
    </div>
  );
}

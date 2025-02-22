import React from 'react';

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Pricing Plans</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="border rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Basic</h2>
          <p className="text-3xl font-bold mb-4">$0</p>
          <ul className="space-y-2 mb-6">
            <li>✓ Basic Resume Analysis</li>
            <li>✓ 1 Resume Template</li>
            <li>✓ Email Support</li>
          </ul>
          <button className="w-full bg-primary text-white py-2 rounded-md">Get Started</button>
        </div>

        <div className="border rounded-lg p-6 shadow-lg bg-primary/5">
          <h2 className="text-xl font-semibold mb-4">Pro</h2>
          <p className="text-3xl font-bold mb-4">$9.99</p>
          <ul className="space-y-2 mb-6">
            <li>✓ Advanced Resume Analysis</li>
            <li>✓ 5 Resume Templates</li>
            <li>✓ Priority Support</li>
            <li>✓ AI Suggestions</li>
          </ul>
          <button className="w-full bg-primary text-white py-2 rounded-md">Subscribe Now</button>
        </div>

        <div className="border rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Enterprise</h2>
          <p className="text-3xl font-bold mb-4">$29.99</p>
          <ul className="space-y-2 mb-6">
            <li>✓ Everything in Pro</li>
            <li>✓ Unlimited Templates</li>
            <li>✓ 24/7 Support</li>
            <li>✓ Custom Branding</li>
          </ul>
          <button className="w-full bg-primary text-white py-2 rounded-md">Contact Sales</button>
        </div>
      </div>
    </div>
  );
}
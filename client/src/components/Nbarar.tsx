
import React from 'react';
import { Menubar, MenubarMenu, MenubarTrigger } from './ui/menubar';

export const Navbar = () => {
  return (
    <Menubar className="border-b px-2 lg:px-4">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
      </MenubarMenu>
    </Menubar>
  );
};

export default Navbar;

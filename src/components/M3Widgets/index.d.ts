import React from 'react';

export * from './M3Actions';
export * from './M3Communication';
export * from './M3Containment';
export * from './M3Navigation';
export * from './M3Selection';
export * from './M3TextInputs';

export interface M3ComponentDef {
  id: string;
  name: string;
  type: string;
  variant: string;
}

export interface M3CategoryDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  components: M3ComponentDef[];
}

export declare const M3_CATEGORIES: M3CategoryDef[];

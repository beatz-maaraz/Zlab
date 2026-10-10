export * from './M3Actions';
export * from './M3Communication';
export * from './M3Containment';
export * from './M3Navigation';
export * from './M3Selection';
export * from './M3TextInputs';

/**
 * 6 Official Material Design 3 Categories with items and metadata
 */
export const M3_CATEGORIES = [
  {
    id: 'actions',
    name: 'Actions',
    description: 'Buttons (Filled, Tonal, Outlined, Text), FAB & Extended FAB',
    icon: 'MousePointerClick',
    components: [
      { id: 'm3-filled-btn', name: 'Filled Button', type: 'M3FilledButton', variant: 'filled' },
      { id: 'm3-tonal-btn', name: 'Tonal Button', type: 'M3TonalButton', variant: 'tonal' },
      { id: 'm3-outlined-btn', name: 'Outlined Button', type: 'M3OutlinedButton', variant: 'outlined' },
      { id: 'm3-text-btn', name: 'Text Button', type: 'M3TextButton', variant: 'text' },
      { id: 'm3-fab', name: 'Floating Action Button (FAB)', type: 'M3Fab', variant: 'fab' },
      { id: 'm3-extended-fab', name: 'Extended FAB', type: 'M3ExtendedFab', variant: 'extended-fab' },
      { id: 'm3-actions-suite', name: 'All Action Buttons Suite', type: 'M3ActionsGroup', variant: 'suite' },
    ],
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Badges, Circular & Linear Progress, Snackbars',
    icon: 'Bell',
    components: [
      { id: 'm3-badge', name: 'Badges (Count & Dot)', type: 'M3BadgeWidget', variant: 'badge' },
      { id: 'm3-progress', name: 'Circular & Linear Progress', type: 'M3ProgressWidget', variant: 'progress' },
      { id: 'm3-snackbar', name: 'M3 Snackbar Banner', type: 'M3SnackbarWidget', variant: 'snackbar' },
      { id: 'm3-comm-suite', name: 'Communication Suite', type: 'M3CommunicationGroup', variant: 'suite' },
    ],
  },
  {
    id: 'containment',
    name: 'Containment',
    description: 'Elevated Cards, Outlined Cards, Dialogs',
    icon: 'Layers',
    components: [
      { id: 'm3-elevated-card', name: 'Elevated Card', type: 'M3ElevatedCard', variant: 'card-elevated' },
      { id: 'm3-outlined-card', name: 'Outlined Card', type: 'M3OutlinedCard', variant: 'card-outlined' },
      { id: 'm3-dialog-card', name: 'Dialog Card Preview', type: 'M3DialogPreview', variant: 'dialog' },
      { id: 'm3-containment-suite', name: 'Containment Suite', type: 'M3ContainmentGroup', variant: 'suite' },
    ],
  },
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'Bottom Navigation, Navigation Drawer, Tabs',
    icon: 'Compass',
    components: [
      { id: 'm3-bottom-nav', name: 'Bottom Navigation Bar', type: 'M3BottomNavWidget', variant: 'bottom-nav' },
      { id: 'm3-tabs', name: 'Tabs Bar', type: 'M3TabsWidget', variant: 'tabs' },
      { id: 'm3-nav-drawer', name: 'Navigation Drawer Rail', type: 'M3NavDrawerWidget', variant: 'drawer' },
      { id: 'm3-nav-suite', name: 'Navigation Suite', type: 'M3NavigationGroup', variant: 'suite' },
    ],
  },
  {
    id: 'selection',
    name: 'Selection',
    description: 'Checkboxes, Radio Buttons, Switches, Sliders',
    icon: 'CheckSquare',
    components: [
      { id: 'm3-switch', name: 'M3 Icon Switch', type: 'M3SwitchWidget', variant: 'switch' },
      { id: 'm3-slider', name: 'Elevation & Blur Slider', type: 'M3SliderWidget', variant: 'slider' },
      { id: 'm3-checkbox', name: 'Checkbox Control', type: 'M3CheckboxWidget', variant: 'checkbox' },
      { id: 'm3-radio', name: 'Radio Group Control', type: 'M3RadioWidget', variant: 'radio' },
      { id: 'm3-selection-suite', name: 'Selection Suite', type: 'M3SelectionGroup', variant: 'suite' },
    ],
  },
  {
    id: 'text-inputs',
    name: 'Text Inputs',
    description: 'Outlined & Filled TextFields, Search Bars',
    icon: 'Edit3',
    components: [
      { id: 'm3-outlined-input', name: 'Outlined TextField', type: 'M3OutlinedTextField', variant: 'outlined-input' },
      { id: 'm3-filled-input', name: 'Filled TextField', type: 'M3FilledTextField', variant: 'filled-input' },
      { id: 'm3-search-input', name: 'Pill Search Bar', type: 'M3SearchField', variant: 'search-input' },
      { id: 'm3-input-suite', name: 'Text Inputs Suite', type: 'M3TextInputsGroup', variant: 'suite' },
    ],
  },
];

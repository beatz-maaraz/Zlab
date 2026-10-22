import { CanvasElement } from '../types';

export interface M3ComponentDef {
  id: string;
  name: string;
  type: string;
  category: string;
  description?: string;
  width?: number;
  height?: number;
}

/**
 * Creates a rich CanvasElement from an M3 component type.
 * Ensures the component renders authentically on the main canvas.
 */
export function createM3CanvasElement(
  compType: string,
  compName: string,
  category: string,
  placement: { x: number; y: number },
  parentId?: string
): CanvasElement {
  const timestamp = Date.now();
  const id = `m3_${compType.toLowerCase()}_${timestamp}`;

  const base: CanvasElement = {
    id,
    name: compName || compType,
    type: 'component',
    x: placement.x,
    y: placement.y,
    width: 260,
    height: 50,
    rotation: 0,
    borderRadius: 16,
    fill: '#1d1b20',
    fillOpacity: 100,
    stroke: '#49454f',
    strokeWidth: 1,
    shadowBlur: 10,
    shadowY: 3,
    shadowSpread: 0,
    visible: true,
    locked: false,
    materialPreset: 'm3',
    m3WidgetType: compType,
    parentId,
  };

  switch (compType) {
    // 1. ACTIONS
    case 'M3FilledButton':
      return {
        ...base,
        type: 'button',
        width: 170,
        height: 44,
        borderRadius: 22,
        fill: '#d0bcff',
        textColor: '#381e72',
        stroke: 'none',
        strokeWidth: 0,
        shadowBlur: 12,
        shadowY: 4,
        textContent: 'Filled Action',
        fontSize: 13,
        variant: 'm3-filled',
      };

    case 'M3TonalButton':
      return {
        ...base,
        type: 'button',
        width: 170,
        height: 44,
        borderRadius: 22,
        fill: '#4a4458',
        textColor: '#e8def8',
        stroke: 'none',
        strokeWidth: 0,
        shadowBlur: 6,
        shadowY: 2,
        textContent: 'Tonal Action',
        fontSize: 13,
        variant: 'm3-tonal',
      };

    case 'M3OutlinedButton':
      return {
        ...base,
        type: 'button',
        width: 170,
        height: 44,
        borderRadius: 22,
        fill: 'transparent',
        textColor: '#d0bcff',
        stroke: '#938f99',
        strokeWidth: 1.5,
        shadowBlur: 0,
        shadowY: 0,
        textContent: 'Outlined Action',
        fontSize: 13,
        variant: 'm3-outlined-btn',
      };

    case 'M3TextButton':
      return {
        ...base,
        type: 'button',
        width: 140,
        height: 40,
        borderRadius: 20,
        fill: 'transparent',
        textColor: '#d0bcff',
        stroke: 'none',
        strokeWidth: 0,
        shadowBlur: 0,
        shadowY: 0,
        textContent: 'Text Button',
        fontSize: 13,
        variant: 'm3-text-btn',
      };

    case 'M3Fab':
      return {
        ...base,
        type: 'button',
        width: 56,
        height: 56,
        borderRadius: 16,
        fill: '#d0bcff',
        textColor: '#381e72',
        stroke: 'none',
        strokeWidth: 0,
        shadowBlur: 16,
        shadowY: 6,
        textContent: '+',
        fontSize: 24,
        variant: 'm3-fab',
      };

    case 'M3ExtendedFab':
      return {
        ...base,
        type: 'button',
        width: 190,
        height: 56,
        borderRadius: 16,
        fill: '#eaddff',
        textColor: '#21005d',
        stroke: 'none',
        strokeWidth: 0,
        shadowBlur: 16,
        shadowY: 6,
        textContent: '✦ Create Design',
        fontSize: 14,
        variant: 'm3-fab-ext',
      };

    case 'M3ActionsGroup':
      return {
        ...base,
        type: 'component',
        width: 440,
        height: 120,
        borderRadius: 24,
        fill: '#1d1b20',
        stroke: '#36343b',
        strokeWidth: 1,
        shadowBlur: 20,
        shadowY: 6,
        textContent: 'Material 3 Actions Suite',
        subText: 'Filled • Tonal • Outlined • Text • FAB',
        variant: 'm3-suite-actions',
      };

    // 2. COMMUNICATION
    case 'M3BadgeWidget':
      return {
        ...base,
        type: 'component',
        width: 240,
        height: 48,
        borderRadius: 12,
        fill: '#211f26',
        stroke: '#49454f',
        strokeWidth: 1,
        shadowBlur: 8,
        shadowY: 2,
        textContent: 'Notifications & Alerts',
        variant: 'm3-badge',
      };

    case 'M3ProgressWidget':
      return {
        ...base,
        type: 'component',
        width: 320,
        height: 80,
        borderRadius: 16,
        fill: '#1d1b20',
        stroke: '#36343b',
        strokeWidth: 1,
        shadowBlur: 12,
        shadowY: 3,
        textContent: 'System Progress (68%)',
        variant: 'm3-progress',
      };

    case 'M3SnackbarWidget':
      return {
        ...base,
        type: 'component',
        width: 340,
        height: 52,
        borderRadius: 8,
        fill: '#313033',
        stroke: 'none',
        strokeWidth: 0,
        shadowBlur: 16,
        shadowY: 4,
        textContent: 'Project changes saved successfully.',
        variant: 'm3-snackbar',
      };

    case 'M3CommunicationGroup':
      return {
        ...base,
        type: 'component',
        width: 380,
        height: 180,
        borderRadius: 24,
        fill: '#1d1b20',
        stroke: '#36343b',
        strokeWidth: 1,
        shadowBlur: 24,
        shadowY: 6,
        textContent: 'Communication Suite',
        subText: 'Badges • Progress • Snackbars',
        variant: 'm3-suite-comm',
      };

    // 3. CONTAINMENT
    case 'M3ElevatedCard':
      return {
        ...base,
        type: 'card',
        width: 320,
        height: 190,
        borderRadius: 20,
        fill: '#211f26',
        stroke: '#36343b',
        strokeWidth: 1,
        shadowBlur: 24,
        shadowY: 6,
        textContent: 'M3 Elevated Container',
        subText: 'Material 3 surface container high with elevation token Level 1 & dynamic colors.',
        textColor: '#e6e0e9',
        fontSize: 15,
        variant: 'm3-card',
      };

    case 'M3OutlinedCard':
      return {
        ...base,
        type: 'card',
        width: 320,
        height: 180,
        borderRadius: 16,
        fill: '#1d1b20',
        stroke: '#49454f',
        strokeWidth: 1.5,
        shadowBlur: 4,
        shadowY: 1,
        textContent: 'M3 Outlined Container',
        subText: 'Zero-elevation clean card with high-contrast outline border token.',
        textColor: '#e6e0e9',
        fontSize: 15,
        variant: 'm3-card-outline',
      };

    case 'M3DialogPreview':
      return {
        ...base,
        type: 'card',
        width: 340,
        height: 190,
        borderRadius: 28,
        fill: '#2b2930',
        stroke: '#49454f',
        strokeWidth: 1,
        shadowBlur: 32,
        shadowY: 10,
        textContent: 'Discard Draft Changes?',
        subText: 'Are you sure you want to discard your recent canvas modifications? This cannot be undone.',
        textColor: '#e6e0e9',
        fontSize: 15,
        variant: 'm3-dialog',
      };

    case 'M3ContainmentGroup':
      return {
        ...base,
        type: 'component',
        width: 420,
        height: 240,
        borderRadius: 24,
        fill: '#1d1b20',
        stroke: '#36343b',
        strokeWidth: 1,
        shadowBlur: 24,
        shadowY: 8,
        textContent: 'Containment Suite',
        subText: 'Elevated Cards • Outlined Cards • Dialogs',
        variant: 'm3-suite-containment',
      };

    // 4. NAVIGATION
    case 'M3BottomNavWidget':
      return {
        ...base,
        type: 'component',
        width: 375,
        height: 72,
        borderRadius: 24,
        fill: '#211f26',
        stroke: '#36343b',
        strokeWidth: 1,
        shadowBlur: 20,
        shadowY: 6,
        textContent: 'Bottom Navigation',
        variant: 'm3-footer-tabs',
      };

    case 'M3TabsWidget':
      return {
        ...base,
        type: 'component',
        width: 360,
        height: 48,
        borderRadius: 12,
        fill: '#1d1b20',
        stroke: '#36343b',
        strokeWidth: 1,
        shadowBlur: 8,
        shadowY: 2,
        textContent: 'Primary Tabs',
        variant: 'm3-tabs',
      };

    case 'M3NavDrawerWidget':
      return {
        ...base,
        type: 'component',
        width: 240,
        height: 280,
        borderRadius: 24,
        fill: '#1d1b20',
        stroke: '#36343b',
        strokeWidth: 1,
        shadowBlur: 20,
        shadowY: 6,
        textContent: 'Navigation Drawer Rail',
        variant: 'm3-drawer',
      };

    case 'M3NavigationGroup':
      return {
        ...base,
        type: 'component',
        width: 440,
        height: 220,
        borderRadius: 24,
        fill: '#1d1b20',
        stroke: '#36343b',
        strokeWidth: 1,
        shadowBlur: 24,
        shadowY: 8,
        textContent: 'Navigation Suite',
        subText: 'Bottom Bar • Tabs • Navigation Rail',
        variant: 'm3-suite-nav',
      };

    // 5. SELECTION
    case 'M3SwitchWidget':
      return {
        ...base,
        type: 'component',
        width: 280,
        height: 52,
        borderRadius: 16,
        fill: '#211f26',
        stroke: '#49454f',
        strokeWidth: 1,
        shadowBlur: 8,
        shadowY: 2,
        textContent: 'Dynamic Color Theme',
        variant: 'm3-switch',
      };

    case 'M3SliderWidget':
      return {
        ...base,
        type: 'component',
        width: 280,
        height: 60,
        borderRadius: 16,
        fill: '#211f26',
        stroke: '#49454f',
        strokeWidth: 1,
        shadowBlur: 8,
        shadowY: 2,
        textContent: 'Elevation Scale',
        variant: 'm3-slider',
      };

    case 'M3CheckboxWidget':
      return {
        ...base,
        type: 'component',
        width: 260,
        height: 48,
        borderRadius: 12,
        fill: '#211f26',
        stroke: '#49454f',
        strokeWidth: 1,
        shadowBlur: 6,
        shadowY: 2,
        textContent: 'Enable Hardware Acceleration',
        variant: 'm3-checkbox',
      };

    case 'M3RadioWidget':
      return {
        ...base,
        type: 'component',
        width: 260,
        height: 48,
        borderRadius: 12,
        fill: '#211f26',
        stroke: '#49454f',
        strokeWidth: 1,
        shadowBlur: 6,
        shadowY: 2,
        textContent: 'Device Target Layout',
        variant: 'm3-radio',
      };

    case 'M3SelectionGroup':
      return {
        ...base,
        type: 'component',
        width: 380,
        height: 220,
        borderRadius: 24,
        fill: '#1d1b20',
        stroke: '#36343b',
        strokeWidth: 1,
        shadowBlur: 24,
        shadowY: 6,
        textContent: 'Selection Suite',
        subText: 'Switches • Sliders • Checkboxes • Radios',
        variant: 'm3-suite-selection',
      };

    // 6. TEXT INPUTS
    case 'M3OutlinedTextField':
      return {
        ...base,
        type: 'input',
        width: 280,
        height: 64,
        borderRadius: 12,
        fill: '#1d1b20',
        stroke: '#49454f',
        strokeWidth: 1,
        shadowBlur: 8,
        shadowY: 2,
        label: 'Design Title',
        textContent: 'Z Lab Mobile Studio',
        helperText: 'Material 3 outlined input token',
        variant: 'm3-outlined-input',
      };

    case 'M3FilledTextField':
      return {
        ...base,
        type: 'input',
        width: 280,
        height: 64,
        borderRadius: 8,
        fill: '#211f26',
        stroke: '#d0bcff',
        strokeWidth: 1.5,
        shadowBlur: 8,
        shadowY: 2,
        label: 'User Handle',
        textContent: '@designer.zlab',
        helperText: 'Material 3 filled input with indicator line',
        variant: 'm3-filled-input',
      };

    case 'M3SearchField':
      return {
        ...base,
        type: 'component',
        width: 320,
        height: 52,
        borderRadius: 26,
        fill: '#211f26',
        stroke: '#49454f',
        strokeWidth: 1,
        shadowBlur: 12,
        shadowY: 3,
        textContent: 'Search components & design tokens...',
        variant: 'm3-search',
      };

    case 'M3TextInputsGroup':
      return {
        ...base,
        type: 'component',
        width: 400,
        height: 220,
        borderRadius: 24,
        fill: '#1d1b20',
        stroke: '#36343b',
        strokeWidth: 1,
        shadowBlur: 24,
        shadowY: 8,
        textContent: 'Text Inputs Suite',
        subText: 'Outlined Input • Filled Input • Search Bar',
        variant: 'm3-suite-inputs',
      };

    default:
      return base;
  }
}

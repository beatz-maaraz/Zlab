import { describe, it, expect } from 'vitest';
import { renderArtboardElementsToHtml } from './exportUtils';
import { CanvasElement } from '../types';

describe('renderArtboardElementsToHtml', () => {
  it('renders elements belonging to mobile artboard correctly', () => {
    const mockElements: Record<string, CanvasElement> = {
      'mobile-app-view': {
        id: 'mobile-app-view',
        name: 'Mobile Screen',
        type: 'frame',
        x: 0,
        y: 0,
        width: 390,
        height: 844,
        rotation: 0,
        borderRadius: 44,
        fill: '#131313',
        fillOpacity: 100,
        stroke: '#3f4753',
        strokeWidth: 2,
        shadowBlur: 32,
        shadowY: 12,
        shadowSpread: 0,
        visible: true,
        locked: false,
      },
      'btn-action': {
        id: 'btn-action',
        name: 'Submit Button',
        type: 'button',
        x: 20,
        y: 500,
        width: 350,
        height: 48,
        rotation: 0,
        borderRadius: 12,
        fill: '#0d99ff',
        fillOpacity: 100,
        stroke: 'none',
        strokeWidth: 0,
        shadowBlur: 10,
        shadowY: 4,
        shadowSpread: 0,
        visible: true,
        locked: false,
        parentId: 'mobile-app-view',
        textContent: 'Confirm Action',
        prototype: {
          trigger: 'tap',
          action: 'navigate',
          destinationId: 'screen-success',
          animation: 'smart_animate',
        },
      },
    };

    const html = renderArtboardElementsToHtml('mobile-app-view', mockElements, true);
    expect(html).toContain('proto-node');
    expect(html).toContain('Confirm Action');
    expect(html).toContain('data-proto-action="navigate"');
    expect(html).toContain('data-proto-dest="screen-success"');
  });

  it('renders elements belonging to desktop artboard correctly', () => {
    const mockElements: Record<string, CanvasElement> = {
      'desktop-1440': {
        id: 'desktop-1440',
        name: 'Desktop Frame',
        type: 'frame',
        x: 0,
        y: 0,
        width: 1440,
        height: 900,
        rotation: 0,
        borderRadius: 8,
        fill: '#131313',
        fillOpacity: 100,
        stroke: '#3f4753',
        strokeWidth: 1,
        shadowBlur: 24,
        shadowY: 8,
        shadowSpread: 0,
        visible: true,
        locked: false,
      },
      'hero-heading': {
        id: 'hero-heading',
        name: 'Hero Heading',
        type: 'text',
        x: 80,
        y: 120,
        width: 600,
        height: 80,
        rotation: 0,
        borderRadius: 0,
        fill: '#ffffff',
        fillOpacity: 100,
        stroke: 'none',
        strokeWidth: 0,
        shadowBlur: 0,
        shadowY: 0,
        shadowSpread: 0,
        visible: true,
        locked: false,
        parentId: 'desktop-1440',
        textContent: 'Craft Experiences Faster',
        fontSize: 32,
      },
    };

    const html = renderArtboardElementsToHtml('desktop-1440', mockElements, false);
    expect(html).toContain('proto-node');
    expect(html).toContain('Craft Experiences Faster');
  });
});

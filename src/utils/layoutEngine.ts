import { CanvasElement } from '../types';

export const computeAutoLayouts = (
  elements: Record<string, CanvasElement>
): Record<string, CanvasElement> => {
  const nextElements = { ...elements };

  // Find all parents that have layoutMode enabled
  const parents = Object.values(nextElements).filter(
    (el) => el.layoutMode && el.layoutMode !== 'none'
  );

  // We should ideally process them from innermost to outermost,
  // but a simple approach for now is a basic iteration.
  
  parents.forEach((parent) => {
    // Get children
    const children = Object.values(nextElements).filter((el) => el.parentId === parent.id);
    if (children.length === 0) return;

    // Sort children based on their current visual order
    if (parent.layoutMode === 'horizontal') {
      children.sort((a, b) => a.x - b.x);
    } else {
      children.sort((a, b) => a.y - b.y);
    }

    const gap = parent.gap || 0;
    const padding = parent.padding || 0;
    const align = parent.alignItems || 'start';

    let currentX = parent.x + padding;
    let currentY = parent.y + padding;

    let maxChildHeight = 0;
    let maxChildWidth = 0;

    children.forEach((child) => {
      // First position the child along the primary axis
      if (parent.layoutMode === 'horizontal') {
        child.x = currentX;
        // Cross axis alignment
        if (align === 'start') {
          child.y = parent.y + padding;
        } else if (align === 'center') {
          child.y = parent.y + (parent.height - child.height) / 2;
        } else if (align === 'end') {
          child.y = parent.y + parent.height - padding - child.height;
        } else if (align === 'stretch') {
          child.y = parent.y + padding;
          child.height = parent.height - padding * 2;
        }

        currentX += child.width + gap;
        maxChildHeight = Math.max(maxChildHeight, child.height);
      } else {
        // Vertical layout
        child.y = currentY;
        // Cross axis alignment
        if (align === 'start') {
          child.x = parent.x + padding;
        } else if (align === 'center') {
          child.x = parent.x + (parent.width - child.width) / 2;
        } else if (align === 'end') {
          child.x = parent.x + parent.width - padding - child.width;
        } else if (align === 'stretch') {
          child.x = parent.x + padding;
          child.width = parent.width - padding * 2;
        }

        currentY += child.height + gap;
        maxChildWidth = Math.max(maxChildWidth, child.width);
      }

      // Update the child in our nextElements map
      nextElements[child.id] = { ...child };
    });

    // Optionally resize the parent to fit content if it has "Hug Contents" enabled
    // For now we assume fixed sizes for the parent, but we could update it here.
  });

  return nextElements;
};

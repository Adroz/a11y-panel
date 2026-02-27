export interface AssessmentCategory {
  key: string;
  label: string;
  gettingStarted: string;
  criteriaIds: string[];
}

export const ASSESSMENT_CATEGORIES: AssessmentCategory[] = [
  {
    key: "keyboard",
    label: "Keyboard",
    gettingStarted:
      "Many people navigate the web using only a keyboard — whether due to motor disabilities, repetitive strain injuries, or personal preference. Every interactive element must be reachable and operable without a mouse.\n\nTo test, put your mouse aside and try using the page with only Tab, Shift+Tab, Enter, Space, Escape, and Arrow keys. Can you reach every button, link, and form control? Can you always move focus away from where it lands?",
    criteriaIds: ["2.1.1", "2.1.2", "2.1.4"],
  },
  {
    key: "focus",
    label: "Focus",
    gettingStarted:
      "Visible focus indicators tell keyboard users where they are on the page. Without them, navigating by keyboard is like using a mouse with an invisible cursor.\n\nTab through the page and check: can you always see which element has focus? Does the focus order follow a logical reading sequence, or does it jump around unexpectedly?",
    criteriaIds: ["2.4.3", "2.4.7"],
  },
  {
    key: "headings-landmarks",
    label: "Headings & Landmarks",
    gettingStarted:
      "Headings and ARIA landmarks create a structural outline that screen reader users rely on to understand and navigate a page. Proper heading hierarchy (h1–h6) and landmarks (banner, navigation, main, contentinfo) let users jump directly to the section they need.\n\nCheck that headings form a logical hierarchy, form controls are properly labeled and grouped, and landmark regions are used to identify major page areas.",
    criteriaIds: ["1.3.1", "2.4.1", "2.4.6"],
  },
  {
    key: "links-navigation",
    label: "Links & Navigation",
    gettingStarted:
      "Links are the primary way users move between pages and within content. Link text should clearly describe where the link goes, and navigation patterns should be consistent and predictable across the site.\n\nLook for vague link text like \"click here\" or \"read more\" — these are meaningless to screen reader users who navigate by links list. Also check that components with visible labels have matching accessible names, and that navigation elements appear in a consistent order.",
    criteriaIds: ["2.4.4", "2.4.5", "2.5.3", "3.2.3", "3.2.4"],
  },
  {
    key: "images",
    label: "Images",
    gettingStarted:
      "Images need text alternatives so people who can't see them still get the information. The right alt text depends on the image's purpose: informative images need descriptive text, decorative images should be hidden from assistive technology, and functional images (like icon buttons) need labels describing their action.\n\nAlso check that text isn't embedded in images when real text could achieve the same presentation — image text can't be resized, reflowed, or read by assistive technology.",
    criteriaIds: ["1.1.1", "1.4.5"],
  },
  {
    key: "sensory-color",
    label: "Sensory & Color",
    gettingStarted:
      "Not everyone perceives color, shape, or motion the same way. Information conveyed by color alone is invisible to colorblind users. Instructions that reference visual location or shape don't work for screen reader users.\n\nCheck that color is never the only way to convey meaning (errors, status, required fields), that text meets minimum contrast ratios, that UI component boundaries are distinguishable, and that nothing flashes more than three times per second.",
    criteriaIds: ["1.3.3", "1.4.1", "1.4.3", "1.4.11", "2.3.1"],
  },
  {
    key: "adaptable-content",
    label: "Adaptable Content",
    gettingStarted:
      "People view the web on everything from large monitors to small phones, and many users zoom in or override text styles to improve readability. Content must adapt without breaking.\n\nTest at 200% browser zoom and 320px viewport width. Override text spacing (line height, letter spacing, word spacing). Check that content reflows into a single column, nothing gets cut off or overlaps, and hover/focus popups are dismissible and hoverable.",
    criteriaIds: ["1.3.2", "1.3.4", "1.4.4", "1.4.10", "1.4.12", "1.4.13"],
  },
  {
    key: "forms-errors",
    label: "Forms & Errors",
    gettingStarted:
      "Forms are one of the most common sources of accessibility barriers. Every input needs a clear label, errors must be described in text (not just color), and suggestions should help users recover from mistakes.\n\nSubmit forms with missing and invalid data. Are errors clearly identified? Do error messages explain what went wrong and how to fix it? For important transactions (financial, legal), is there a review step or a way to undo?",
    criteriaIds: ["1.3.5", "3.3.1", "3.3.2", "3.3.3", "3.3.4"],
  },
  {
    key: "widgets",
    label: "Widgets",
    gettingStarted:
      "Custom interactive components — tabs, accordions, dialogs, sliders, date pickers — need proper ARIA roles, states, and properties so assistive technology can understand and announce them. Without these, a screen reader might see a clickable div instead of a checkbox.\n\nInspect custom widgets with browser DevTools: does each have an accessible name and appropriate role? Are state changes (expanded, selected, checked) reflected in ARIA attributes? Are status messages announced without moving focus?",
    criteriaIds: ["4.1.1", "4.1.2", "4.1.3"],
  },
  {
    key: "timed-events",
    label: "Timed Events",
    gettingStarted:
      "Time limits, auto-playing media, and auto-updating content can be serious barriers. Users with cognitive or motor disabilities may need more time to read or interact. Auto-playing audio interferes with screen readers.\n\nIdentify any time-limited interactions, auto-playing audio, and moving or auto-updating content. Can users pause, stop, or extend each one?",
    criteriaIds: ["1.4.2", "2.2.1", "2.2.2"],
  },
  {
    key: "multimedia",
    label: "Multimedia",
    gettingStarted:
      "Video and audio content needs alternatives: captions for deaf users, audio descriptions for blind users, and transcripts for anyone who can't access the media in its original format.\n\nIdentify all audio and video content on the page. Does prerecorded video have accurate captions? Is audio description available for videos with important visual information? Do audio-only recordings have text transcripts?",
    criteriaIds: ["1.2.1", "1.2.2", "1.2.3", "1.2.4", "1.2.5"],
  },
  {
    key: "language",
    label: "Language",
    gettingStarted:
      "Screen readers need to know what language content is written in to pronounce it correctly. A page in English read with a French voice synthesizer is incomprehensible.\n\nCheck that the page has a valid lang attribute on the <html> element, and that any sections in a different language have their own lang attribute.",
    criteriaIds: ["3.1.1", "3.1.2"],
  },
  {
    key: "pointer-motion",
    label: "Pointer & Motion",
    gettingStarted:
      "Not everyone can perform complex gestures like pinching, swiping, or shaking a device. People with motor disabilities may use a single switch, head pointer, or other assistive input that only supports simple clicks.\n\nCheck that any multipoint or path-based gestures have a single-pointer alternative, that actions don't trigger on the down-event (allowing cancellation), and that motion-based features can be disabled.",
    criteriaIds: ["2.5.1", "2.5.2", "2.5.4"],
  },
  {
    key: "predictable-behaviour",
    label: "Predictable Behaviour",
    gettingStarted:
      "Users expect the page to behave predictably. Focus shouldn't trigger navigation, changing a form value shouldn't submit it, and every page should have a descriptive title.\n\nTab through interactive elements — does anything unexpected happen when an element receives focus? Change form selections — does the page navigate or submit without warning? Check that the page title describes the current content.",
    criteriaIds: ["2.4.2", "3.2.1", "3.2.2"],
  },
];

export type WcagPrinciple =
  | "perceivable"
  | "operable"
  | "understandable"
  | "robust";

export interface WcagCriterion {
  id: string;
  level: "A" | "AA";
  principle: WcagPrinciple;
  name: string;
  description: string;
  testingSteps: string[];
  canAutoDetect: boolean;
}

export const PRINCIPLES: {
  value: WcagPrinciple;
  label: string;
  description: string;
}[] = [
  {
    value: "perceivable",
    label: "Perceivable",
    description:
      "Information and user interface components must be presentable to users in ways they can perceive.",
  },
  {
    value: "operable",
    label: "Operable",
    description:
      "User interface components and navigation must be operable by all users.",
  },
  {
    value: "understandable",
    label: "Understandable",
    description:
      "Information and the operation of the user interface must be understandable.",
  },
  {
    value: "robust",
    label: "Robust",
    description:
      "Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.",
  },
];

export const WCAG_CRITERIA: WcagCriterion[] = [
  // ─────────────────────────────────────────────
  // 1. Perceivable
  // ─────────────────────────────────────────────

  // 1.1 Text Alternatives
  {
    id: "1.1.1",
    level: "A",
    principle: "perceivable",
    name: "Non-text Content",
    description:
      "All non-text content has a text alternative that serves the equivalent purpose, except for specific situations like decorative images, CAPTCHAs, or sensory content.",
    testingSteps: [
      "Identify all images, icons, and non-text content on the page.",
      "Verify each has appropriate alt text that conveys the same information.",
      "Confirm decorative images use empty alt text (alt=\"\") or are marked as presentational.",
    ],
    canAutoDetect: true,
  },

  // 1.2 Time-based Media
  {
    id: "1.2.1",
    level: "A",
    principle: "perceivable",
    name: "Audio-only and Video-only (Prerecorded)",
    description:
      "Prerecorded audio-only content has a text transcript; prerecorded video-only content has either a text alternative or an audio track describing the visual information.",
    testingSteps: [
      "Identify all prerecorded audio-only and video-only content.",
      "Verify audio-only content has an accurate text transcript available.",
      "Verify video-only content has a descriptive text alternative or audio track.",
    ],
    canAutoDetect: false,
  },
  {
    id: "1.2.2",
    level: "A",
    principle: "perceivable",
    name: "Captions (Prerecorded)",
    description:
      "Captions are provided for all prerecorded audio content in synchronized media.",
    testingSteps: [
      "Identify all prerecorded video content with audio.",
      "Verify captions are present and synchronized with the audio.",
      "Check that captions accurately represent all spoken dialogue and important sounds.",
    ],
    canAutoDetect: false,
  },
  {
    id: "1.2.3",
    level: "A",
    principle: "perceivable",
    name: "Audio Description or Media Alternative (Prerecorded)",
    description:
      "An audio description or a full text alternative is provided for prerecorded synchronized media.",
    testingSteps: [
      "Identify all prerecorded video content with important visual information not conveyed by audio.",
      "Verify an audio description track or a full text alternative is available.",
      "Check that the alternative adequately describes key visual content.",
    ],
    canAutoDetect: false,
  },
  {
    id: "1.2.4",
    level: "AA",
    principle: "perceivable",
    name: "Captions (Live)",
    description:
      "Captions are provided for all live audio content in synchronized media.",
    testingSteps: [
      "Identify all live audio/video streams on the page.",
      "Verify real-time captions are provided during live broadcasts.",
      "Check that live captions accurately represent spoken content.",
    ],
    canAutoDetect: false,
  },
  {
    id: "1.2.5",
    level: "AA",
    principle: "perceivable",
    name: "Audio Description (Prerecorded)",
    description:
      "Audio description is provided for all prerecorded video content in synchronized media.",
    testingSteps: [
      "Identify all prerecorded video content where visual information is not fully conveyed by the existing audio.",
      "Verify an audio description track is available.",
      "Confirm the audio description conveys important visual details during natural pauses.",
    ],
    canAutoDetect: false,
  },

  // 1.3 Adaptable
  {
    id: "1.3.1",
    level: "A",
    principle: "perceivable",
    name: "Info and Relationships",
    description:
      "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.",
    testingSteps: [
      "Verify headings use proper heading elements (h1-h6) in a logical hierarchy.",
      "Check that form inputs have associated labels and are grouped where appropriate.",
      "Confirm lists use proper list markup (ul, ol, dl) and tables use th, caption, and scope attributes.",
    ],
    canAutoDetect: true,
  },
  {
    id: "1.3.2",
    level: "A",
    principle: "perceivable",
    name: "Meaningful Sequence",
    description:
      "When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.",
    testingSteps: [
      "Disable CSS and verify the content reading order remains logical.",
      "Use a screen reader to navigate the page and confirm the reading order matches the visual order.",
      "Check that tabindex values do not create an unexpected or confusing sequence.",
    ],
    canAutoDetect: false,
  },
  {
    id: "1.3.3",
    level: "A",
    principle: "perceivable",
    name: "Sensory Characteristics",
    description:
      "Instructions do not rely solely on sensory characteristics such as shape, color, size, visual location, orientation, or sound.",
    testingSteps: [
      "Search for instructions that reference shape, color, size, or location (e.g., 'click the round button' or 'the red text').",
      "Verify each instruction also provides a non-sensory identifier such as a text label.",
      "Confirm error messages and status indicators do not rely solely on color or position.",
    ],
    canAutoDetect: false,
  },
  {
    id: "1.3.4",
    level: "AA",
    principle: "perceivable",
    name: "Orientation",
    description:
      "Content does not restrict its view and operation to a single display orientation unless a specific orientation is essential.",
    testingSteps: [
      "Rotate the device or viewport between portrait and landscape modes.",
      "Verify all content and functionality remains accessible in both orientations.",
      "Check that no CSS or JavaScript locks the page to a single orientation.",
    ],
    canAutoDetect: false,
  },
  {
    id: "1.3.5",
    level: "AA",
    principle: "perceivable",
    name: "Identify Input Purpose",
    description:
      "The purpose of each input field collecting personal user information can be programmatically determined when the input serves a common purpose.",
    testingSteps: [
      "Identify form fields that collect personal information (name, email, address, phone, etc.).",
      "Verify each has an appropriate autocomplete attribute value.",
      "Confirm the autocomplete values match the actual expected input (e.g., autocomplete=\"email\" for email fields).",
    ],
    canAutoDetect: true,
  },

  // 1.4 Distinguishable
  {
    id: "1.4.1",
    level: "A",
    principle: "perceivable",
    name: "Use of Color",
    description:
      "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.",
    testingSteps: [
      "Identify elements that use color to convey meaning (links, errors, required fields, status indicators).",
      "Verify each also uses a non-color indicator such as underline, icon, pattern, or text label.",
      "View the page in grayscale to confirm information is still distinguishable.",
    ],
    canAutoDetect: false,
  },
  {
    id: "1.4.2",
    level: "A",
    principle: "perceivable",
    name: "Audio Control",
    description:
      "If audio plays automatically for more than 3 seconds, a mechanism is available to pause, stop, or control the volume independently from the system volume.",
    testingSteps: [
      "Identify any audio that plays automatically when the page loads.",
      "Verify a visible control is available to pause, stop, or adjust volume.",
      "Confirm the audio control is keyboard-accessible and operable with assistive technology.",
    ],
    canAutoDetect: false,
  },
  {
    id: "1.4.3",
    level: "AA",
    principle: "perceivable",
    name: "Contrast (Minimum)",
    description:
      "Text and images of text have a contrast ratio of at least 4.5:1 (3:1 for large text).",
    testingSteps: [
      "Use a contrast checker tool to measure foreground-to-background color ratios for all text.",
      "Verify normal text meets at least 4.5:1 contrast ratio.",
      "Verify large text (18pt or 14pt bold) meets at least 3:1 contrast ratio.",
    ],
    canAutoDetect: true,
  },
  {
    id: "1.4.4",
    level: "AA",
    principle: "perceivable",
    name: "Resize Text",
    description:
      "Text can be resized up to 200% without assistive technology and without loss of content or functionality.",
    testingSteps: [
      "Zoom the browser to 200% using Ctrl/Cmd + plus.",
      "Verify all text content remains visible and readable without horizontal scrolling.",
      "Confirm no content is clipped, overlapping, or hidden at 200% zoom.",
    ],
    canAutoDetect: false,
  },
  {
    id: "1.4.5",
    level: "AA",
    principle: "perceivable",
    name: "Images of Text",
    description:
      "If the same visual presentation can be made with text alone, an image of text is not used to convey information, except for customizable images or where a particular presentation is essential.",
    testingSteps: [
      "Identify any images that contain text (logos, banners, headings rendered as images).",
      "Determine whether real text could achieve the same visual presentation.",
      "Verify that essential images of text (e.g., logos) have appropriate alt text.",
    ],
    canAutoDetect: false,
  },
  {
    id: "1.4.10",
    level: "AA",
    principle: "perceivable",
    name: "Reflow",
    description:
      "Content can be presented without loss of information or functionality and without requiring scrolling in two dimensions at 320 CSS pixels wide (for vertical scrolling content) or 256 CSS pixels tall (for horizontal scrolling content).",
    testingSteps: [
      "Set the browser viewport width to 320px (or zoom to 400%).",
      "Verify all content reflows into a single column without horizontal scrolling.",
      "Confirm no information is lost, truncated, or overlapping at this width.",
    ],
    canAutoDetect: false,
  },
  {
    id: "1.4.11",
    level: "AA",
    principle: "perceivable",
    name: "Non-text Contrast",
    description:
      "User interface components and graphical objects have a contrast ratio of at least 3:1 against adjacent colors.",
    testingSteps: [
      "Identify all meaningful UI components (buttons, form inputs, icons, focus indicators).",
      "Measure the contrast ratio of each component boundary against its adjacent background.",
      "Verify each meets the minimum 3:1 contrast ratio.",
    ],
    canAutoDetect: false,
  },
  {
    id: "1.4.12",
    level: "AA",
    principle: "perceivable",
    name: "Text Spacing",
    description:
      "No loss of content or functionality occurs when users override text spacing: line height to 1.5x, paragraph spacing to 2x, letter spacing to 0.12em, and word spacing to 0.16em.",
    testingSteps: [
      "Apply the following CSS overrides: line-height: 1.5em, paragraph margin-bottom: 2em, letter-spacing: 0.12em, word-spacing: 0.16em.",
      "Verify no content is clipped, hidden, or overlapping after the overrides.",
      "Confirm all interactive elements remain usable and visible.",
    ],
    canAutoDetect: false,
  },
  {
    id: "1.4.13",
    level: "AA",
    principle: "perceivable",
    name: "Content on Hover or Focus",
    description:
      "Where pointer hover or keyboard focus triggers additional content to appear, the additional content is dismissible, hoverable, and persistent.",
    testingSteps: [
      "Identify all tooltips, popovers, and content that appears on hover or focus.",
      "Verify the extra content can be dismissed (e.g., pressing Escape) without moving focus or pointer.",
      "Confirm the user can hover over the newly revealed content without it disappearing, and it remains visible until the user dismisses it or moves focus/pointer away.",
    ],
    canAutoDetect: false,
  },

  // ─────────────────────────────────────────────
  // 2. Operable
  // ─────────────────────────────────────────────

  // 2.1 Keyboard Accessible
  {
    id: "2.1.1",
    level: "A",
    principle: "operable",
    name: "Keyboard",
    description:
      "All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.",
    testingSteps: [
      "Navigate through the entire page using only the Tab, Shift+Tab, Enter, Space, and Arrow keys.",
      "Verify all interactive elements (links, buttons, form controls, menus) can be reached and activated via keyboard.",
      "Confirm no functionality is only available via mouse hover, drag, or other pointer-specific interactions.",
    ],
    canAutoDetect: false,
  },
  {
    id: "2.1.2",
    level: "A",
    principle: "operable",
    name: "No Keyboard Trap",
    description:
      "If keyboard focus can be moved to a component using a keyboard interface, then focus can be moved away from that component using only a keyboard interface.",
    testingSteps: [
      "Tab through all interactive elements on the page.",
      "Verify you can always move focus away from any component using Tab, Shift+Tab, Escape, or Arrow keys.",
      "Pay special attention to modal dialogs, media players, embedded widgets, and custom components.",
    ],
    canAutoDetect: true,
  },
  {
    id: "2.1.4",
    level: "A",
    principle: "operable",
    name: "Character Key Shortcuts",
    description:
      "If a keyboard shortcut uses only letter, punctuation, number, or symbol characters, it can be turned off, remapped, or is only active on focus.",
    testingSteps: [
      "Identify all single-character keyboard shortcuts on the page.",
      "Verify each shortcut can be turned off or remapped by the user.",
      "Confirm shortcuts that cannot be remapped are only active when the relevant component has focus.",
    ],
    canAutoDetect: false,
  },

  // 2.2 Enough Time
  {
    id: "2.2.1",
    level: "A",
    principle: "operable",
    name: "Timing Adjustable",
    description:
      "For each time limit set by the content, the user can turn off, adjust, or extend the time, unless the time limit is essential.",
    testingSteps: [
      "Identify all timed interactions (session timeouts, auto-advancing content, countdown timers).",
      "Verify users are warned before time expires and given the option to extend.",
      "Confirm the user can extend the time limit at least 10 times or turn it off entirely.",
    ],
    canAutoDetect: false,
  },
  {
    id: "2.2.2",
    level: "A",
    principle: "operable",
    name: "Pause, Stop, Hide",
    description:
      "For moving, blinking, scrolling, or auto-updating information, there is a mechanism to pause, stop, or hide it.",
    testingSteps: [
      "Identify all moving, blinking, scrolling, or auto-updating content (carousels, tickers, animations, live feeds).",
      "Verify a visible mechanism exists to pause, stop, or hide each one.",
      "Confirm the mechanism is keyboard-accessible and does not restart the content unexpectedly.",
    ],
    canAutoDetect: false,
  },

  // 2.3 Seizures and Physical Reactions
  {
    id: "2.3.1",
    level: "A",
    principle: "operable",
    name: "Three Flashes or Below Threshold",
    description:
      "Pages do not contain anything that flashes more than three times per second, or the flash is below the general flash and red flash thresholds.",
    testingSteps: [
      "Visually inspect the page for any flashing, blinking, or strobing content.",
      "Verify any flashing content does not exceed three flashes per second.",
      "Use the Photosensitive Epilepsy Analysis Tool (PEAT) or similar tool if rapid flashing is suspected.",
    ],
    canAutoDetect: false,
  },

  // 2.4 Navigable
  {
    id: "2.4.1",
    level: "A",
    principle: "operable",
    name: "Bypass Blocks",
    description:
      "A mechanism is available to bypass blocks of content that are repeated on multiple pages.",
    testingSteps: [
      "Press Tab from the top of the page and check for a 'Skip to main content' or similar skip link.",
      "Verify the skip link moves focus past repeated navigation to the main content area.",
      "Check that ARIA landmarks (banner, navigation, main, contentinfo) are properly used.",
    ],
    canAutoDetect: true,
  },
  {
    id: "2.4.2",
    level: "A",
    principle: "operable",
    name: "Page Titled",
    description:
      "Pages have titles that describe their topic or purpose.",
    testingSteps: [
      "Check the browser tab or title bar for a descriptive page title.",
      "Verify the title uniquely identifies the page content and distinguishes it from other pages.",
      "For single-page applications, confirm the title updates when the view changes.",
    ],
    canAutoDetect: true,
  },
  {
    id: "2.4.3",
    level: "A",
    principle: "operable",
    name: "Focus Order",
    description:
      "If a page can be navigated sequentially, focusable components receive focus in an order that preserves meaning and operability.",
    testingSteps: [
      "Tab through all interactive elements and verify the focus order follows a logical sequence.",
      "Confirm the focus order matches the visual layout (left-to-right, top-to-bottom for LTR languages).",
      "Check that dynamically inserted content (modals, dropdowns) receives focus in a logical position.",
    ],
    canAutoDetect: false,
  },
  {
    id: "2.4.4",
    level: "A",
    principle: "operable",
    name: "Link Purpose (In Context)",
    description:
      "The purpose of each link can be determined from the link text alone or from the link text together with its programmatically determined context.",
    testingSteps: [
      "Review all link text on the page and identify any generic text ('click here', 'read more', 'learn more').",
      "Verify each link's purpose can be understood from its text, or from the text plus its surrounding context (paragraph, list item, or aria-label).",
      "Check that links with identical text but different destinations are distinguishable in context.",
    ],
    canAutoDetect: true,
  },
  {
    id: "2.4.5",
    level: "AA",
    principle: "operable",
    name: "Multiple Ways",
    description:
      "More than one way is available to locate a page within a set of pages, except where the page is a result of or a step in a process.",
    testingSteps: [
      "Verify at least two navigation methods are available (e.g., main navigation, site search, sitemap, breadcrumbs).",
      "Confirm each method is functional and leads to the correct pages.",
      "Check that search functionality returns relevant results.",
    ],
    canAutoDetect: false,
  },
  {
    id: "2.4.6",
    level: "AA",
    principle: "operable",
    name: "Headings and Labels",
    description:
      "Headings and labels describe the topic or purpose of the content they introduce.",
    testingSteps: [
      "Review all headings on the page and verify each accurately describes its section content.",
      "Check that form labels clearly describe what input is expected.",
      "Confirm headings and labels are not vague, duplicated, or misleading.",
    ],
    canAutoDetect: false,
  },
  {
    id: "2.4.7",
    level: "AA",
    principle: "operable",
    name: "Focus Visible",
    description:
      "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible.",
    testingSteps: [
      "Tab through all interactive elements and verify each shows a visible focus indicator.",
      "Confirm focus indicators have sufficient contrast against the background.",
      "Check that custom focus styles are not suppressed with outline: none without providing an alternative.",
    ],
    canAutoDetect: false,
  },

  // 2.5 Input Modalities
  {
    id: "2.5.1",
    level: "A",
    principle: "operable",
    name: "Pointer Gestures",
    description:
      "All functionality that uses multipoint or path-based gestures can be operated with a single pointer without a path-based gesture, unless the gesture is essential.",
    testingSteps: [
      "Identify all interactions requiring multipoint gestures (pinch, multi-finger swipe) or path-based gestures (drawing, swiping).",
      "Verify an alternative single-pointer method is available for each (e.g., tap buttons for zoom instead of pinch).",
      "Confirm the alternative achieves the same result as the gesture.",
    ],
    canAutoDetect: false,
  },
  {
    id: "2.5.2",
    level: "A",
    principle: "operable",
    name: "Pointer Cancellation",
    description:
      "For functionality operated by a single pointer, at least one of the following is true: no down-event, abort/undo, up reversal, or essential.",
    testingSteps: [
      "Click down on interactive elements and drag the pointer away before releasing.",
      "Verify the action does not trigger on the down-event alone (it should trigger on the up-event or provide a way to cancel).",
      "Check that accidental activation can be undone or reversed.",
    ],
    canAutoDetect: false,
  },
  {
    id: "2.5.3",
    level: "A",
    principle: "operable",
    name: "Label in Name",
    description:
      "For user interface components with labels that include text or images of text, the accessible name contains the text that is presented visually.",
    testingSteps: [
      "Identify all interactive elements with visible text labels.",
      "Inspect each element's accessible name (via DevTools or screen reader) and verify it includes the visible label text.",
      "Check that aria-label or aria-labelledby values do not contradict or omit the visible text.",
    ],
    canAutoDetect: true,
  },
  {
    id: "2.5.4",
    level: "A",
    principle: "operable",
    name: "Motion Actuation",
    description:
      "Functionality triggered by device motion or user motion can also be operated through a user interface component, and the motion trigger can be disabled.",
    testingSteps: [
      "Identify any functionality triggered by shaking, tilting, or other device motions.",
      "Verify an equivalent user interface control (button, link) is available as an alternative.",
      "Confirm the motion-based trigger can be disabled to prevent accidental activation.",
    ],
    canAutoDetect: false,
  },

  // ─────────────────────────────────────────────
  // 3. Understandable
  // ─────────────────────────────────────────────

  // 3.1 Readable
  {
    id: "3.1.1",
    level: "A",
    principle: "understandable",
    name: "Language of Page",
    description:
      "The default human language of each page can be programmatically determined.",
    testingSteps: [
      "Inspect the html element for a lang attribute (e.g., lang=\"en\").",
      "Verify the lang value matches the primary language of the page content.",
      "Check that the lang attribute uses a valid BCP 47 language tag.",
    ],
    canAutoDetect: true,
  },
  {
    id: "3.1.2",
    level: "AA",
    principle: "understandable",
    name: "Language of Parts",
    description:
      "The human language of each passage or phrase in the content can be programmatically determined, except for proper names, technical terms, or indeterminate language.",
    testingSteps: [
      "Identify sections of content written in a different language than the page default.",
      "Verify each foreign-language passage has a lang attribute on its containing element.",
      "Confirm the lang attribute values are correct for the language used.",
    ],
    canAutoDetect: true,
  },

  // 3.2 Predictable
  {
    id: "3.2.1",
    level: "A",
    principle: "understandable",
    name: "On Focus",
    description:
      "When a user interface component receives focus, it does not initiate a change of context.",
    testingSteps: [
      "Tab through all focusable elements on the page.",
      "Verify that receiving focus does not trigger a page navigation, form submission, or significant content change.",
      "Check that focus events do not open new windows or move focus to a different component unexpectedly.",
    ],
    canAutoDetect: false,
  },
  {
    id: "3.2.2",
    level: "A",
    principle: "understandable",
    name: "On Input",
    description:
      "Changing the setting of any user interface component does not automatically cause a change of context unless the user has been advised in advance.",
    testingSteps: [
      "Interact with all form controls (select menus, checkboxes, radio buttons, text inputs).",
      "Verify that changing a value does not trigger a page navigation or form submission without user confirmation.",
      "If a context change is necessary, confirm the user is warned before the control.",
    ],
    canAutoDetect: false,
  },
  {
    id: "3.2.3",
    level: "AA",
    principle: "understandable",
    name: "Consistent Navigation",
    description:
      "Navigation mechanisms that are repeated on multiple pages within a set occur in the same relative order each time, unless changed by the user.",
    testingSteps: [
      "Navigate to several pages within the site and compare the order of repeated navigation elements.",
      "Verify the primary navigation, secondary navigation, and footer links appear in the same relative order.",
      "Confirm any changes to navigation order are user-initiated.",
    ],
    canAutoDetect: false,
  },
  {
    id: "3.2.4",
    level: "AA",
    principle: "understandable",
    name: "Consistent Identification",
    description:
      "Components that have the same functionality within a set of pages are identified consistently.",
    testingSteps: [
      "Identify components with the same function across pages (search, login, navigation icons).",
      "Verify they use the same labels, icons, and accessible names consistently.",
      "Check that similar functionality is not labeled differently on different pages.",
    ],
    canAutoDetect: false,
  },

  // 3.3 Input Assistance
  {
    id: "3.3.1",
    level: "A",
    principle: "understandable",
    name: "Error Identification",
    description:
      "If an input error is automatically detected, the item in error is identified and the error is described to the user in text.",
    testingSteps: [
      "Submit forms with empty required fields and invalid data.",
      "Verify each error is identified with a clear text description near the input.",
      "Confirm error messages are programmatically associated with their inputs (e.g., via aria-describedby or aria-errormessage).",
    ],
    canAutoDetect: false,
  },
  {
    id: "3.3.2",
    level: "A",
    principle: "understandable",
    name: "Labels or Instructions",
    description:
      "Labels or instructions are provided when content requires user input.",
    testingSteps: [
      "Identify all form inputs on the page.",
      "Verify each input has a visible label or instruction indicating what data is expected.",
      "Check that required fields are indicated and format requirements (e.g., date format) are communicated.",
    ],
    canAutoDetect: true,
  },
  {
    id: "3.3.3",
    level: "AA",
    principle: "understandable",
    name: "Error Suggestion",
    description:
      "If an input error is detected and suggestions are known, the suggestions are provided to the user unless it would jeopardize security.",
    testingSteps: [
      "Enter invalid data in form fields (wrong format, out-of-range values).",
      "Verify error messages include specific suggestions for correction (e.g., 'Please enter a date in MM/DD/YYYY format').",
      "Confirm suggestions are helpful and not overly technical.",
    ],
    canAutoDetect: false,
  },
  {
    id: "3.3.4",
    level: "AA",
    principle: "understandable",
    name: "Error Prevention (Legal, Financial, Data)",
    description:
      "For pages causing legal commitments or financial transactions, or that modify/delete user-controllable data, submissions are reversible, checked, or confirmed.",
    testingSteps: [
      "Identify forms that result in legal, financial, or data-modification transactions.",
      "Verify a review/confirmation step is provided before final submission.",
      "Check that submissions can be reversed or that data entered is validated and the user can correct errors before finalizing.",
    ],
    canAutoDetect: false,
  },

  // ─────────────────────────────────────────────
  // 4. Robust
  // ─────────────────────────────────────────────

  // 4.1 Compatible
  {
    id: "4.1.1",
    level: "A",
    principle: "robust",
    name: "Parsing",
    description:
      "In content implemented using markup languages, elements have complete start and end tags, are nested according to their specifications, do not contain duplicate attributes, and IDs are unique.",
    testingSteps: [
      "Run the page through the W3C HTML Validator or browser DevTools to check for parsing errors.",
      "Verify there are no duplicate ID values in the document.",
      "Confirm all elements have proper opening and closing tags and correct nesting.",
    ],
    canAutoDetect: true,
  },
  {
    id: "4.1.2",
    level: "A",
    principle: "robust",
    name: "Name, Role, Value",
    description:
      "For all user interface components, the name and role can be programmatically determined, states and properties and values that can be set by the user can be programmatically set, and notification of changes is available to user agents.",
    testingSteps: [
      "Inspect custom interactive components (dropdowns, tabs, accordions, sliders) with browser DevTools accessibility inspector.",
      "Verify each has an accessible name, appropriate ARIA role, and correct state/property values.",
      "Confirm state changes (expanded, selected, checked) are reflected in ARIA attributes and announced by screen readers.",
    ],
    canAutoDetect: true,
  },
  {
    id: "4.1.3",
    level: "AA",
    principle: "robust",
    name: "Status Messages",
    description:
      "Status messages can be programmatically determined through role or properties so they can be presented to the user by assistive technologies without receiving focus.",
    testingSteps: [
      "Identify dynamic status messages (success notifications, error alerts, loading indicators, search result counts).",
      "Verify each uses an appropriate ARIA live region (role=\"status\", role=\"alert\", aria-live=\"polite\" or \"assertive\").",
      "Test with a screen reader to confirm status messages are announced without moving focus.",
    ],
    canAutoDetect: true,
  },
];

export interface PlainCriterion {
  description: string;
  testingSteps: string[];
}

export const PLAIN_CHECKLIST: Record<string, PlainCriterion> = {
  // Principle 1: Perceivable

  '1.1.1': {
    description:
      'Every image, icon, and non-text element needs a text alternative that conveys the same information, so screen reader users know what it is.',
    testingSteps: [
      'Look at each image on the page and ask: if this image disappeared, would a text description still convey the same meaning?',
      'Check that decorative images (ones that add no information) are hidden from screen reader users.',
      'Verify that buttons with only icons have accessible labels describing their action.',
      'Check that charts and graphs include a text summary of the key data.',
    ],
  },

  '1.2.1': {
    description:
      'Pre-recorded audio-only content (like podcasts) needs a text transcript, and pre-recorded video-only content (like silent animations) needs either a transcript or an audio description.',
    testingSteps: [
      'Find any audio-only content and check that a text transcript is provided nearby.',
      'Find any video-only content (no audio track) and check that a text description or audio narration is available.',
      'Verify the transcript or description covers all the important information from the media.',
    ],
  },

  '1.2.2': {
    description:
      'Pre-recorded videos with audio must have captions so that deaf or hard-of-hearing users can follow along.',
    testingSteps: [
      'Play each video and turn on captions.',
      'Check that captions accurately reflect the spoken dialogue.',
      'Verify that important sound effects (like a doorbell or alarm) are also captioned.',
      'Make sure captions are properly timed with the audio.',
    ],
  },

  '1.2.3': {
    description:
      'Pre-recorded videos need either an audio description narrating important visual details, or a full text transcript as an alternative.',
    testingSteps: [
      'Watch each video and note whether important visual information is only shown on screen (not spoken aloud).',
      'Check that either an audio description track is available, or a full text transcript is provided.',
      'Verify the description or transcript covers visual details that are not mentioned in the regular audio.',
    ],
  },

  '1.2.4': {
    description:
      'Live video content with audio (like webinars or live streams) must have real-time captions.',
    testingSteps: [
      'During a live broadcast, check that captions appear in real time.',
      'Verify the captions are reasonably accurate and keep up with the speaker.',
    ],
  },

  '1.2.5': {
    description:
      'Pre-recorded videos must have an audio description track that narrates important visual details that are not covered by the main audio.',
    testingSteps: [
      'Watch each video and identify moments where important information is only shown visually.',
      'Check that an audio description option is available that narrates these visual details.',
      'Verify the audio description does not conflict with or talk over important dialogue.',
    ],
  },

  '1.3.1': {
    description:
      'The structure of the page (headings, lists, tables, form fields, and regions) must be communicated to screen reader users, not just shown visually.',
    testingSteps: [
      'Check that headings on the page follow a logical order (a main heading, then sub-headings beneath it).',
      'Verify that lists of items are presented as actual lists, not just lines of text with dashes.',
      'Check that data tables have proper row and column headers.',
      'Verify that each form field has a visible label clearly associated with it.',
      'Check that required fields are identified in a way that does not rely only on colour.',
    ],
  },

  '1.3.2': {
    description:
      'The reading order of the page must make sense. Content should follow a logical sequence so that screen reader users encounter information in the right order.',
    testingSteps: [
      'Tab through the page and verify you encounter content in a logical, expected order.',
      'Check that content that visually appears side-by-side is read in a sensible sequence.',
      'Verify that no information is lost or becomes confusing when read from top to bottom.',
    ],
  },

  '1.3.3': {
    description:
      'Instructions must not rely only on shape, size, position, or sound. For example, don\'t say "click the round button" or "see the sidebar on the right" without also providing another way to identify the element.',
    testingSteps: [
      'Search for instructions that reference shape (e.g., "the square icon"), location (e.g., "the menu on the left"), or sound (e.g., "after the beep").',
      'Verify that each instruction also identifies the element by name or label.',
      'Check that error or success messages do not rely only on position or colour to communicate meaning.',
    ],
  },

  '1.3.4': {
    description:
      'The page must work in both portrait and landscape orientations. Users should not be forced into one specific orientation unless it is essential (like a piano keyboard app).',
    testingSteps: [
      'View the page on a phone or tablet in portrait mode, then rotate to landscape.',
      'Check that the content adapts and remains fully usable in both orientations.',
      'Verify that no message appears telling users to rotate their device (unless the content truly requires a specific orientation).',
    ],
  },

  '1.3.5': {
    description:
      'Form fields that collect common personal information (name, email, address, phone, etc.) should be set up so that browsers can auto-fill them correctly.',
    testingSteps: [
      'Go to a form that asks for personal information (name, email, address, etc.).',
      'Check whether your browser offers to auto-fill the fields correctly.',
      'Verify that the auto-filled values end up in the right fields (e.g., your email does not appear in the phone field).',
    ],
  },

  '1.4.1': {
    description:
      'Colour must not be the only way to convey information. For example, if errors are shown in red, they should also have an icon or text label.',
    testingSteps: [
      'Look at the page and identify anywhere colour is used to communicate something (errors, required fields, status indicators, chart data).',
      'For each case, check whether the information is also conveyed by text, icons, patterns, or other non-colour cues.',
      'View links within text and check they are distinguishable from surrounding text by more than just colour (e.g., they are underlined).',
    ],
  },

  '1.4.2': {
    description:
      'If any audio plays automatically for more than 3 seconds, there must be a way to pause, stop, or control the volume independently from the system volume.',
    testingSteps: [
      'Load each page and listen for any audio that plays automatically.',
      'If auto-playing audio lasts more than 3 seconds, check for a visible pause, stop, or volume control.',
      'Verify the control works and is easy to find.',
    ],
  },

  '1.4.3': {
    description:
      'Text must have enough contrast against its background to be readable. Small text needs a contrast ratio of at least 4.5:1, and large text (roughly 18pt or bigger) needs at least 3:1.',
    testingSteps: [
      'Look for text that appears faint, washed out, or hard to read against its background.',
      'Pay special attention to light grey text on white backgrounds, or text over images.',
      'Use a contrast checking tool to verify the contrast ratio meets the minimum requirements.',
      'Check placeholder text in form fields for sufficient contrast.',
    ],
  },

  '1.4.4': {
    description:
      'Users must be able to zoom in or increase text size up to 200% without losing content or functionality. Text should not get cut off or overlap.',
    testingSteps: [
      'Zoom your browser to 200% (use the browser zoom or text-size settings).',
      'Check that all text is still readable and no content is cut off or hidden.',
      'Verify that no text overlaps other text or elements.',
      'Make sure all buttons and controls remain usable at 200% zoom.',
    ],
  },

  '1.4.5': {
    description:
      'Use real text rather than images of text. If something is shown as a picture of words, it should be actual text instead (unless a specific visual presentation is essential, like a logo).',
    testingSteps: [
      'Look for any text on the page that is actually an image (you can try selecting the text with your cursor -- if you cannot select individual words, it may be an image).',
      'Check whether that image of text could be replaced with real, styled text.',
      'Logos and brand names that require a specific font are acceptable as images.',
    ],
  },

  '1.4.10': {
    description:
      'When the page is zoomed to 400% (or viewed at a width of 320 pixels), content must reflow into a single column with no horizontal scrolling required.',
    testingSteps: [
      'Set your browser window to 320 pixels wide (or zoom to 400%).',
      'Check that all content reflows into a single column.',
      'Verify there is no horizontal scrollbar needed to read the content (data tables and toolbars are exceptions).',
      'Make sure no content or controls are hidden or cut off.',
    ],
  },

  '1.4.11': {
    description:
      'Interactive controls (buttons, form fields, etc.) and meaningful graphics must have enough contrast against their surrounding colours, with at least a 3:1 ratio.',
    testingSteps: [
      'Look at buttons, input fields, checkboxes, and other controls. Check that their borders or backgrounds are clearly visible against the page.',
      'Check that icons and graphics needed to understand the content are clearly visible.',
      'Verify that the focused state of controls is clearly distinguishable.',
      'Use a contrast checking tool to confirm a 3:1 ratio for these elements.',
    ],
  },

  '1.4.12': {
    description:
      'Users must be able to increase text spacing (line height, letter spacing, word spacing, and paragraph spacing) without content being cut off or overlapping.',
    testingSteps: [
      'Use a text spacing testing tool or bookmarklet to increase line height, letter spacing, word spacing, and paragraph spacing.',
      'Check that no text is cut off or hidden after the spacing changes.',
      'Verify that no text overlaps other content.',
      'Make sure all content and controls remain functional.',
    ],
  },

  '1.4.13': {
    description:
      'When extra content appears because you hover over something with your mouse or move keyboard focus to it (like tooltips or pop-ups), users must be able to dismiss it, move their pointer over it, and it should stay visible until they move away.',
    testingSteps: [
      'Find any tooltips, pop-overs, or drop-down menus that appear on hover or focus.',
      'Check that you can move your mouse pointer onto the pop-up content without it disappearing.',
      'Verify you can dismiss the pop-up (e.g., by pressing Escape) without having to move the mouse.',
      'Check that the content stays visible until you deliberately move away or dismiss it.',
    ],
  },

  // Principle 2: Operable

  '2.1.1': {
    description:
      'Everything on the page must be usable with just a keyboard. Users who cannot use a mouse need to be able to reach and operate all interactive elements by pressing Tab, Enter, Space, and arrow keys.',
    testingSteps: [
      'Put your mouse aside and try to use the entire page with only your keyboard.',
      'Press Tab to move through all interactive elements (links, buttons, form fields, menus).',
      'Check that you can activate buttons and links with Enter, and toggle checkboxes with Space.',
      'Verify that drop-down menus, sliders, and custom controls can all be operated with the keyboard.',
      'Check that you can reach and use every feature without needing a mouse.',
    ],
  },

  '2.1.2': {
    description:
      'Keyboard users must never get stuck. If you can Tab into a component, you must always be able to Tab back out of it.',
    testingSteps: [
      'Tab through the entire page using only your keyboard.',
      'Pay special attention to modal dialogs, embedded media players, calendar pickers, and custom widgets.',
      'Verify that you can always move focus away from any element without getting stuck.',
      'If a modal or pop-up opens, check that pressing Escape or Tab eventually lets you leave it.',
    ],
  },

  '2.1.4': {
    description:
      'If the page uses single-character keyboard shortcuts (like "s" for search), users must be able to turn them off, remap them, or they should only work when a specific control has focus.',
    testingSteps: [
      'Try pressing common letter and number keys on the page to see if any shortcuts are triggered.',
      'If single-key shortcuts exist, check whether there is a way to disable or change them in settings.',
      'Verify that these shortcuts do not fire unexpectedly while typing in a text field.',
    ],
  },

  '2.2.1': {
    description:
      'If the page has a time limit (like a session timeout or a timed quiz), users must be able to turn it off, adjust it, or extend it before time runs out.',
    testingSteps: [
      'Identify any time limits on the page (session timeouts, countdown timers, auto-advancing content).',
      'Check that you are warned before time runs out and given the option to extend it.',
      'Verify the option to extend is easy to find and use.',
      'If possible, check whether there is an option to turn off or adjust the time limit entirely.',
    ],
  },

  '2.2.2': {
    description:
      'Any content that moves, blinks, scrolls, or auto-updates (like carousels, tickers, or animations) must have a way to pause, stop, or hide it.',
    testingSteps: [
      'Look for any auto-playing carousels, scrolling tickers, animated banners, or auto-updating content.',
      'Check that each one has a visible pause or stop button.',
      'Verify the pause button actually stops the movement.',
      'Check that auto-updating content (like live feeds) can be paused.',
    ],
  },

  '2.3.1': {
    description:
      'Nothing on the page should flash more than three times per second. Flashing content can trigger seizures in people with photosensitive epilepsy.',
    testingSteps: [
      'Watch the page for any flashing or blinking content.',
      'If something flashes, check that it does not flash more than three times in any one-second period.',
      'Pay attention to videos, animations, and GIFs that might contain rapid flashing.',
    ],
  },

  '2.4.1': {
    description:
      'There must be a way to skip past repeated blocks of content (like navigation menus) so keyboard users can jump straight to the main content.',
    testingSteps: [
      'Press Tab as the very first action on the page.',
      'Check that a "Skip to main content" or similar link appears.',
      'Activate the skip link and verify that focus moves past the navigation to the main content area.',
      'Check that heading structure also allows screen reader users to jump between sections.',
    ],
  },

  '2.4.2': {
    description:
      'Every page must have a descriptive title that appears in the browser tab, helping users identify which page they are on.',
    testingSteps: [
      'Look at the browser tab for each page and check that it has a clear, descriptive title.',
      'Verify the title describes the page content or purpose (not just the site name).',
      'Check that different pages have different titles so they can be told apart.',
    ],
  },

  '2.4.3': {
    description:
      'When you Tab through the page, the focus order must follow a logical sequence that matches the visual layout. Focus should not jump around unpredictably.',
    testingSteps: [
      'Tab through all interactive elements on the page.',
      'Check that focus moves in a logical, predictable order (generally left to right, top to bottom).',
      'Verify that focus does not jump to unexpected places on the page.',
      'After interacting with a dialog or pop-up, check that focus returns to a sensible location.',
    ],
  },

  '2.4.4': {
    description:
      'The purpose of every link must be clear from the link text itself, or from the link text combined with its surrounding context. Avoid vague links like "click here" or "read more".',
    testingSteps: [
      'Read through all links on the page.',
      'Check that each link clearly describes where it goes or what it does (e.g., "Download the annual report" instead of "Click here").',
      'If a link says something generic like "Read more", check that the surrounding text makes the destination clear.',
      'Verify that links to different destinations have different link text.',
    ],
  },

  '2.4.5': {
    description:
      'There must be more than one way to find any page within the site, such as a navigation menu, a site map, a search feature, or related links.',
    testingSteps: [
      'Check that the site provides at least two ways to find content (e.g., a navigation menu plus a search bar, or a navigation menu plus a site map).',
      'Verify the search function returns relevant results.',
      'Check that the navigation menu provides a clear path to all key pages.',
    ],
  },

  '2.4.6': {
    description:
      'Headings and labels must clearly describe the topic or purpose of the content they introduce. They should be meaningful, not vague.',
    testingSteps: [
      'Read each heading on the page and check that it clearly describes the section beneath it.',
      'Read each form label and check that it clearly describes what information to enter.',
      'Verify that headings are not vague (e.g., "Miscellaneous" or "Section 2") when a more descriptive heading would work.',
    ],
  },

  '2.4.7': {
    description:
      'When you Tab to an interactive element, there must be a clearly visible focus indicator (like an outline or highlight) so keyboard users always know where they are on the page.',
    testingSteps: [
      'Tab through the page using your keyboard.',
      'Check that every interactive element (link, button, form field) shows a clearly visible outline or highlight when it has focus.',
      'Verify the focus indicator is easy to see against the background.',
      'Make sure the focus indicator is never completely hidden or invisible.',
    ],
  },

  '2.5.1': {
    description:
      'Any action that requires a multi-point or path-based gesture (like pinch-to-zoom, swiping, or drawing) must also be achievable with a simple single-pointer action like a tap or click.',
    testingSteps: [
      'Identify any features that use swiping, pinching, dragging a path, or multi-finger gestures.',
      'Check that each feature also offers a simple alternative like a button tap or click.',
      'For example, if a carousel requires swiping, verify there are also next/previous buttons.',
    ],
  },

  '2.5.2': {
    description:
      'For actions triggered by clicking or tapping, the action should happen on releasing the pointer (lifting your finger or releasing the mouse button), and users must be able to cancel the action by moving away before releasing.',
    testingSteps: [
      'Click and hold on buttons and controls, then drag your pointer away before releasing.',
      'Verify that the action is cancelled (not triggered) when you release outside the target.',
      'Check that drag-and-drop interactions can be cancelled by dropping in the original position or pressing Escape.',
    ],
  },

  '2.5.3': {
    description:
      'When a control has a visible text label, the accessible name (what screen reader users hear) must include that same visible text. What people see and what screen reader users hear should match.',
    testingSteps: [
      'Look at buttons and controls that have visible text labels.',
      'If you use a screen reader or accessibility testing tool, verify that the announced name includes the visible text.',
      'Check that the visible label and the accessible name are not contradictory or completely different.',
    ],
  },

  '2.5.4': {
    description:
      'Any action triggered by device motion (like shaking or tilting a phone) must also be available through a standard on-screen control, and users must be able to disable the motion trigger.',
    testingSteps: [
      'Check whether any features are triggered by shaking, tilting, or moving the device.',
      'Verify that each motion-triggered feature also has an on-screen button alternative.',
      'Check that there is a setting to disable the motion-based activation.',
    ],
  },

  // Principle 3: Understandable

  '3.1.1': {
    description:
      'The primary language of the page must be identified so that screen readers can pronounce the text correctly.',
    testingSteps: [
      'Use an accessibility testing tool to verify the page has its language set correctly.',
      'If the page is in English, confirm the language is set to English (and similarly for other languages).',
      'Listen with a screen reader to check that it pronounces the text using the correct language.',
    ],
  },

  '3.1.2': {
    description:
      'When a section of text is in a different language than the rest of the page (e.g., a French quote on an English page), that section must be identified so screen readers can switch pronunciation.',
    testingSteps: [
      'Look for any content on the page that is in a different language from the rest of the page.',
      'Check that these sections are tagged so that a screen reader would switch to the correct language for pronunciation.',
      'Common examples include foreign phrases, quotes, or names in a different language.',
    ],
  },

  '3.2.1': {
    description:
      'Moving focus to an element (like tabbing to a form field) must not automatically trigger an unexpected change, such as opening a new page, submitting a form, or significantly changing the content.',
    testingSteps: [
      'Tab through all interactive elements on the page.',
      'Check that nothing unexpected happens just because an element receives focus (no new windows open, no forms submit, no major content changes occur).',
      'Verify that drop-downs and menus do not navigate you to a new page just by receiving focus.',
    ],
  },

  '3.2.2': {
    description:
      'Changing the value of a form control (like selecting an option from a drop-down) must not automatically trigger an unexpected change unless the user has been warned beforehand.',
    testingSteps: [
      'Interact with drop-down menus, radio buttons, checkboxes, and other form controls.',
      'Check that selecting an option does not unexpectedly navigate to a new page or submit the form.',
      'If a control does trigger a change (like a filter), verify that the user is informed in advance or that a separate "Apply" or "Submit" button is provided.',
    ],
  },

  '3.2.3': {
    description:
      'Navigation menus and other repeating elements must appear in the same order on every page of the site. Users should not have to relearn the layout on each page.',
    testingSteps: [
      'Visit several different pages on the site.',
      'Check that the main navigation menu appears in the same location and in the same order on every page.',
      'Verify that other repeated elements (footer, search bar, sidebar) are also consistent across pages.',
    ],
  },

  '3.2.4': {
    description:
      'Elements that have the same function across different pages must be labelled consistently. For example, a search button should not be called "Search" on one page and "Find" on another.',
    testingSteps: [
      'Visit several different pages and compare similar features.',
      'Check that buttons, icons, and links that perform the same function have the same labels across pages.',
      'Verify that the search feature, login/logout buttons, and navigation items use consistent names throughout the site.',
    ],
  },

  '3.3.1': {
    description:
      'When a user makes an error in a form, the error must be clearly identified and described in text. Users need to know what went wrong and where.',
    testingSteps: [
      'Submit a form with missing or incorrect information.',
      'Check that error messages appear and clearly explain what the problem is.',
      'Verify the error messages identify which specific field has the error.',
      'Make sure errors are not communicated only by colour (e.g., a red border alone is not enough -- there should also be text).',
    ],
  },

  '3.3.2': {
    description:
      'Form fields must have visible labels or instructions that tell users what information is expected. Required fields, expected formats (like date formats), and any constraints should be clear.',
    testingSteps: [
      'Look at each form field and check that it has a clear, visible label.',
      'Verify that required fields are marked (e.g., with an asterisk and a note explaining what it means).',
      'Check that expected formats are described (e.g., "Date: DD/MM/YYYY").',
      'Make sure instructions are provided before the form, not only after an error occurs.',
    ],
  },

  '3.3.3': {
    description:
      'When the system can detect an error and knows what the correct input should be, it must suggest a fix. For example, if the email format is wrong, suggest what a correct email looks like.',
    testingSteps: [
      'Enter invalid data into form fields (wrong email format, out-of-range numbers, etc.).',
      'Check that the error message includes a helpful suggestion for how to fix the problem.',
      'Verify the suggestion is specific and actionable (e.g., "Please enter an email address like name@example.com").',
    ],
  },

  '3.3.4': {
    description:
      'For forms that involve legal commitments, financial transactions, or important data changes, users must be able to review, confirm, reverse, or correct their submissions before they are final.',
    testingSteps: [
      'Complete a form that involves a financial transaction, legal agreement, or important data update.',
      'Check that a confirmation or review step is provided before final submission.',
      'Verify that users can go back and correct their entries.',
      'Check whether submissions can be reversed or cancelled after the fact.',
    ],
  },

  // Principle 4: Robust

  '4.1.1': {
    description:
      'The page code must be clean and well-formed so that browsers and assistive technologies can interpret it correctly. This is largely handled by modern browsers but errors in the code can still cause issues.',
    testingSteps: [
      'Run the page through an automated accessibility or markup validation tool.',
      'Check for any reported errors related to duplicate identifiers or badly structured code.',
      'Verify that the page works correctly across different browsers.',
    ],
  },

  '4.1.2': {
    description:
      'All interactive components (buttons, links, form fields, custom widgets) must communicate their name, role, and current state to screen readers. For example, a screen reader should announce "Submit button" not just "Submit".',
    testingSteps: [
      'Use an accessibility testing tool to check that all buttons, links, and form fields have proper names.',
      'Verify that custom controls (like toggle switches, accordions, or tab panels) announce their type and current state (e.g., "expanded" or "collapsed").',
      'Check that when a control changes state (e.g., a checkbox is checked), the new state is announced.',
      'Verify that custom controls are not just styled to look interactive but actually behave correctly for screen reader users.',
    ],
  },

  '4.1.3': {
    description:
      'Important status messages (like "Item added to cart", "Form submitted successfully", or "3 search results found") must be announced to screen reader users without moving focus away from where they are.',
    testingSteps: [
      'Trigger actions that produce status messages (add to cart, submit a form, perform a search, trigger an error).',
      'Check that the status message is displayed visually.',
      'Verify that a screen reader would announce the status message without the user having to navigate to it.',
      'Confirm that focus does not jump to the status message unexpectedly.',
    ],
  },
};

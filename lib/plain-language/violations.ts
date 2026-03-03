export interface PlainViolation {
  help: string;
  description: string;
  fix: string;
}

export const PLAIN_VIOLATIONS: Record<string, PlainViolation> = {
  accesskeys: {
    help: "Keyboard shortcuts must be unique",
    description:
      "When keyboard shortcuts are assigned to page elements, each shortcut key must be unique. Duplicate shortcuts confuse people and make keyboard navigation unreliable.",
    fix: "Find the elements that share the same keyboard shortcut and change them so each one uses a different key.",
  },
  "area-alt": {
    help: "Clickable map areas need descriptive text",
    description:
      "Image maps have clickable regions that link to different pages. Each clickable region needs a text description so screen reader users know where each link goes.",
    fix: 'Add an "alt" attribute with a short description to each clickable area in the image map.',
  },
  "aria-allowed-attr": {
    help: "Element has an unsupported attribute for its role",
    description:
      "An attribute was added to an element that doesn't support it. This can confuse assistive tools and cause them to misrepresent the element to users.",
    fix: "Remove the unsupported attribute from this element, or change the element's role to one that supports it.",
  },
  "aria-allowed-role": {
    help: "Element has an unsuitable role assigned",
    description:
      "An element was given a role that doesn't make sense for that type of element. This can cause assistive tools to present it incorrectly.",
    fix: "Remove the role from this element or change it to a role that is appropriate for this type of element.",
  },
  "aria-braille-equivalent": {
    help: "Braille attributes need matching visible text",
    description:
      "An element has a braille-specific label but is missing a corresponding regular text label. Braille labels should supplement regular labels, not replace them.",
    fix: "Add a regular text label to this element in addition to the braille-specific label.",
  },
  "aria-command-name": {
    help: "Buttons and links need a label",
    description:
      "A button, link, or menu item doesn't have a name that assistive tools can detect. Users who rely on screen readers won't know what this control does.",
    fix: "Add visible text inside the element, or add a text label attribute so assistive tools can announce its purpose.",
  },
  "aria-conditional-attr": {
    help: "Attribute not allowed in this element's current state",
    description:
      "An element has an attribute that is only valid in certain states, and the element isn't in one of those states. This can send conflicting information to assistive tools.",
    fix: "Remove the attribute that doesn't apply to this element's current state, or change the element's state so the attribute makes sense.",
  },
  "aria-deprecated-role": {
    help: "Element uses an outdated role",
    description:
      "This element uses a role that has been retired from the specification. Assistive tools may not recognise it, which means users could miss this content.",
    fix: "Replace the outdated role with the recommended modern equivalent.",
  },
  "aria-dialog-name": {
    help: "Pop-up dialogs need a title",
    description:
      "A pop-up dialog box doesn't have a title. Screen reader users need to hear the title so they know what the dialog is about.",
    fix: "Add a title to the dialog, either as visible text linked to the dialog or as a label attribute.",
  },
  "aria-hidden-body": {
    help: "The page body must not be hidden from assistive tools",
    description:
      "The entire page body has been marked as hidden from assistive tools. This makes the whole page invisible to screen reader users.",
    fix: 'Remove the "aria-hidden" attribute from the body element so screen readers can access the page content.',
  },
  "aria-hidden-focus": {
    help: "Hidden elements should not be focusable with the keyboard",
    description:
      "An element that is hidden from screen readers can still receive keyboard focus. This creates a confusing experience where keyboard users tab to something they can't see or hear described.",
    fix: "Either make the element visible to screen readers, or make it so it cannot receive keyboard focus while it is hidden.",
  },
  "aria-input-field-name": {
    help: "Form input fields need a label",
    description:
      "A form input field (like a text box, slider, or combo box) doesn't have a label that assistive tools can detect. Users won't know what information to enter.",
    fix: "Add a visible text label next to the input field and connect it to the field, or add a label attribute to the element.",
  },
  "aria-meter-name": {
    help: "Meter displays need a label",
    description:
      "A meter (a gauge showing a value within a range) doesn't have a label. Screen reader users won't know what the meter is measuring.",
    fix: "Add a visible text label that describes what the meter measures, and connect it to the meter element.",
  },
  "aria-progressbar-name": {
    help: "Progress bars need a label",
    description:
      "A progress bar doesn't have a label. Screen reader users won't know what process the progress bar is tracking.",
    fix: "Add a visible text label that describes what is loading or progressing, and connect it to the progress bar.",
  },
  "aria-prohibited-attr": {
    help: "Element has an attribute it should not have",
    description:
      "An element has an attribute that is explicitly not allowed for its type. This can cause assistive tools to present incorrect information to users.",
    fix: "Remove the prohibited attribute from this element.",
  },
  "aria-required-attr": {
    help: "Element is missing a required attribute",
    description:
      "An element has a role that requires certain attributes to work properly, but one or more of those attributes is missing. Assistive tools may not be able to present the element correctly.",
    fix: "Add the missing required attributes to this element so assistive tools can understand it fully.",
  },
  "aria-required-children": {
    help: "Element is missing required child elements",
    description:
      "Some elements need specific types of child elements inside them to work correctly. For example, a list needs list items. The required children are missing here.",
    fix: "Add the required child elements inside this element, or assign the correct roles to the existing children.",
  },
  "aria-required-parent": {
    help: "Element is not inside its required parent",
    description:
      "Some elements must be placed inside a specific type of parent element to work correctly. For example, a list item must be inside a list. This element is missing its required parent.",
    fix: "Move this element inside the correct parent element, or wrap it in the required parent.",
  },
  "aria-roledescription": {
    help: "Custom role descriptions must be on elements with a valid role",
    description:
      "A custom role description was added to an element that doesn't have an appropriate role. The description won't make sense without the right role context.",
    fix: "Either add an appropriate role to this element or remove the custom role description.",
  },
  "aria-roles": {
    help: "Element has an invalid role",
    description:
      "An element has been assigned a role that doesn't exist. Assistive tools won't know how to present this element to users.",
    fix: "Change the role to a valid one, or remove it entirely if the element's default behaviour is sufficient.",
  },
  "aria-text": {
    help: "Text container should not break up content for screen readers",
    description:
      'An element marked as text contains focusable elements inside it. This can cause screen readers to read the content in a confusing, broken-up way instead of as a continuous passage.',
    fix: "Remove the text role from this container, or move the focusable elements outside of it.",
  },
  "aria-toggle-field-name": {
    help: "Toggle controls need a label",
    description:
      "A toggle control (like a checkbox, switch, or radio button) doesn't have a label that assistive tools can detect. Users won't know what option this control represents.",
    fix: "Add a visible text label next to the toggle control and connect it to the control, or add a label attribute.",
  },
  "aria-tooltip-name": {
    help: "Tooltips need text content",
    description:
      "A tooltip element doesn't have any text content. Screen reader users won't hear anything when they encounter this tooltip.",
    fix: "Add descriptive text content inside the tooltip element.",
  },
  "aria-treeitem-name": {
    help: "Tree view items need a label",
    description:
      "An item in a tree view (like a file browser or nested menu) doesn't have a label. Screen reader users won't know what the item represents.",
    fix: "Add visible text to the tree item, or provide a text label attribute.",
  },
  "aria-valid-attr": {
    help: "Element has a misspelled or nonexistent attribute",
    description:
      "An element has an attribute that isn't recognised. It may be misspelled or it may not exist. Assistive tools will ignore it.",
    fix: "Check the attribute name for typos and correct it, or remove it if it isn't needed.",
  },
  "aria-valid-attr-value": {
    help: "Attribute has an invalid value",
    description:
      "An element has an attribute with a value that isn't allowed. Assistive tools may ignore the attribute or misinterpret it.",
    fix: "Change the attribute value to one that is valid for that attribute.",
  },
  "audio-caption": {
    help: "Audio content needs captions",
    description:
      "Audio content doesn't have captions or a text transcript. People who are deaf or hard of hearing won't be able to access the information.",
    fix: "Add captions to the audio content or provide a text transcript nearby.",
  },
  "autocomplete-valid": {
    help: "Form field has an incorrect autocomplete value",
    description:
      "A form field has an autocomplete value that doesn't match the type of information the field collects. This can cause browsers to suggest the wrong type of information.",
    fix: "Change the autocomplete value to match what the field is actually asking for (e.g. use \"email\" for an email field, \"tel\" for a phone number).",
  },
  "avoid-inline-spacing": {
    help: "Text spacing must not be overridden in a way users can't change",
    description:
      "Text spacing has been set directly on elements in a way that prevents users from adjusting it with their own style preferences. Some people need extra spacing to read comfortably.",
    fix: "Move the text spacing styles (line height, letter spacing, word spacing) to a stylesheet instead of setting them directly on the element.",
  },
  blink: {
    help: "Blinking content is not allowed",
    description:
      "Blinking content can be extremely distracting and can trigger seizures in people with photosensitive conditions. It is also very difficult to read.",
    fix: "Remove the blinking effect entirely. Use a different method to draw attention to important content, such as bold text or a highlighted background.",
  },
  "button-name": {
    help: "Buttons need a label",
    description:
      "A button doesn't have any text that describes what it does. Screen reader users will hear \"button\" but won't know its purpose.",
    fix: "Add visible text inside the button, or add a text label so screen readers can announce what the button does.",
  },
  bypass: {
    help: "Page needs a way to skip repeated content",
    description:
      "There is no way to skip past navigation menus and other repeated content that appears on every page. Keyboard and screen reader users have to tab through all of it before reaching the main content.",
    fix: "Add a \"Skip to main content\" link at the top of the page, or use landmark regions (like header, navigation, and main) to let users jump between sections.",
  },
  "color-contrast": {
    help: "Text doesn't have enough contrast with its background",
    description:
      "The text colour is too similar to the background colour, making it hard to read. This affects everyone, especially people with low vision or colour vision differences.",
    fix: "Increase the contrast between the text colour and the background colour. Use darker text on light backgrounds or lighter text on dark backgrounds. Normal-size text needs a contrast ratio of at least 4.5:1, and large text needs at least 3:1.",
  },
  "color-contrast-enhanced": {
    help: "Text contrast could be improved further",
    description:
      "While the text may meet basic contrast requirements, it does not meet the enhanced contrast level. Higher contrast makes text easier to read for more people.",
    fix: "Increase the contrast between text and background. Normal-size text should have a contrast ratio of at least 7:1, and large text should have at least 4.5:1.",
  },
  "css-orientation-lock": {
    help: "Page must not be locked to one screen orientation",
    description:
      "The page is locked to either portrait or landscape orientation. Some people mount their devices in a fixed position and cannot rotate them.",
    fix: "Remove the style rules that lock the page to a specific orientation so it works in both portrait and landscape.",
  },
  "definition-list": {
    help: "Definition lists must be structured correctly",
    description:
      "A definition list (used for terms and their definitions) contains elements that don't belong. This can cause screen readers to misrepresent the list structure.",
    fix: "Make sure the definition list only contains term and definition pairs grouped correctly. Remove or move any other elements.",
  },
  dlitem: {
    help: "Definition items must be inside a definition list",
    description:
      "A term or definition element is not inside a definition list. Screen readers won't be able to associate the term with its definition.",
    fix: "Wrap the term and definition elements inside a definition list element.",
  },
  "document-title": {
    help: "Page needs a title",
    description:
      "The page doesn't have a title. The title appears in the browser tab and is the first thing screen reader users hear. Without it, users can't tell which page they're on.",
    fix: "Add a descriptive title to the page that summarises its content or purpose.",
  },
  "duplicate-id": {
    help: "Element IDs must be unique",
    description:
      "Multiple elements on the page share the same ID. IDs should be unique because browsers and assistive tools use them to locate specific elements. Duplicates can cause unpredictable behaviour.",
    fix: "Change the duplicate IDs so that every element has a unique identifier.",
  },
  "duplicate-id-active": {
    help: "Interactive elements must have unique IDs",
    description:
      "Multiple interactive elements (like buttons, links, or form fields) share the same ID. This can cause focus and label connections to break, making some controls unusable.",
    fix: "Change the duplicate IDs so each interactive element has its own unique identifier.",
  },
  "duplicate-id-aria": {
    help: "IDs used by labels and descriptions must be unique",
    description:
      "An ID that is referenced by a label or description is used on more than one element. This means the label or description may point to the wrong element.",
    fix: "Make sure each ID used for labelling or describing elements is unique on the page.",
  },
  "empty-heading": {
    help: "Headings must have text content",
    description:
      "A heading element is empty — it has no text inside it. Screen reader users navigate pages by jumping between headings, so an empty heading creates a confusing dead-end.",
    fix: "Add descriptive text inside the heading, or remove the heading if it's not needed.",
  },
  "empty-table-header": {
    help: "Table headers must have text content",
    description:
      "A table header cell is empty. Screen readers use header text to describe the data in each column or row. Without it, users can't understand what the data means.",
    fix: "Add descriptive text to the empty table header cell, or change it to a regular table cell if it isn't meant to be a header.",
  },
  "focus-order-semantics": {
    help: "Focusable elements should have an appropriate role",
    description:
      "An element that can receive keyboard focus doesn't have a role that makes sense for an interactive element. This may confuse assistive tools about the element's purpose.",
    fix: "Add an appropriate role to the element (such as button or link), or use the correct type of element instead.",
  },
  "form-field-multiple-labels": {
    help: "Form fields should have only one label",
    description:
      "A form field has more than one label connected to it. Multiple labels can confuse screen readers, which may only announce one of them or read them in an unexpected order.",
    fix: "Remove the extra labels so the form field has exactly one clear label.",
  },
  "frame-focusable-content": {
    help: "Embedded frames with content must be focusable",
    description:
      "An embedded frame contains interactive content but cannot be reached with the keyboard. Keyboard users won't be able to access anything inside the frame.",
    fix: "Make the frame focusable by adding a tabindex attribute, or ensure the content inside the frame is accessible another way.",
  },
  "frame-tested": {
    help: "Embedded frames must be testable for accessibility",
    description:
      "An embedded frame could not be tested for accessibility issues. This means there may be hidden problems inside it that weren't detected.",
    fix: "Make sure the content inside the embedded frame loads correctly so it can be tested for accessibility.",
  },
  "frame-title": {
    help: "Embedded frames need a title",
    description:
      "An embedded frame (like an embedded video or external content) doesn't have a title. Screen reader users need the title to know what the frame contains before entering it.",
    fix: "Add a descriptive title to the frame that explains what content it contains.",
  },
  "frame-title-unique": {
    help: "Embedded frames must have unique titles",
    description:
      "Multiple embedded frames share the same title. Screen reader users rely on unique titles to tell frames apart and navigate to the right one.",
    fix: "Give each embedded frame a unique, descriptive title.",
  },
  "heading-order": {
    help: "Heading levels should increase by one",
    description:
      "A heading skips one or more levels (for example, jumping from a level 2 heading to a level 4). Screen reader users navigate by heading levels, and skipped levels suggest missing content sections.",
    fix: "Adjust the heading levels so they increase by one at a time without skipping (1, then 2, then 3, and so on).",
  },
  "hidden-content": {
    help: "Hidden content should be checked manually",
    description:
      "Some content on this page is hidden and could not be automatically tested. Hidden content may still be accessible to screen reader users or may become visible through interaction.",
    fix: "Review the hidden content to make sure it is accessible when it becomes visible, and that it is properly hidden from screen readers when it should be.",
  },
  "html-has-lang": {
    help: "Page must specify its language",
    description:
      "The page doesn't declare what language it is written in. Screen readers need this information to pronounce the text correctly.",
    fix: 'Add a language attribute to the page\'s opening HTML tag (for example, lang="en" for English).',
  },
  "html-lang-valid": {
    help: "Page language must be a valid language code",
    description:
      "The page declares a language that isn't a valid language code. Screen readers won't be able to use it to determine the correct pronunciation.",
    fix: 'Change the language attribute to a valid language code (for example, "en" for English, "fr" for French, "es" for Spanish).',
  },
  "html-xml-lang-mismatch": {
    help: "Page language attributes must match",
    description:
      "The page has two language attributes that specify different languages. This contradiction can confuse screen readers about which pronunciation to use.",
    fix: "Make sure both language attributes on the HTML element specify the same language.",
  },
  "identical-links-same-purpose": {
    help: "Links with the same name should go to the same place",
    description:
      "Multiple links on the page have the same text but go to different destinations. This is confusing for everyone, especially screen reader users who navigate by listing all links on a page.",
    fix: "Either make the link text unique for each destination, or ensure identically-named links all point to the same URL.",
  },
  "image-alt": {
    help: "Images need descriptive text",
    description:
      "An image doesn't have alternative text that describes what it shows. Screen reader users will either hear nothing or hear the file name, which is rarely helpful.",
    fix: 'Add an "alt" attribute to the image with a brief description of what it shows. If the image is purely decorative, use an empty alt attribute (alt="") to tell screen readers to skip it.',
  },
  "image-redundant-alt": {
    help: "Image description should not repeat surrounding text",
    description:
      "An image's alternative text is the same as text already visible nearby. Screen reader users will hear the same information twice, which is redundant and annoying.",
    fix: 'Change the image\'s alt text so it adds information beyond what the surrounding text already says, or set it to empty (alt="") if the nearby text fully describes the image.',
  },
  "input-button-name": {
    help: "Input buttons need a label",
    description:
      "A button created with an input element doesn't have a visible label. Screen reader users won't know what the button does.",
    fix: "Add a value attribute with descriptive text to the input button, such as \"Submit\" or \"Search\".",
  },
  "input-image-alt": {
    help: "Image buttons need descriptive text",
    description:
      "A button that uses an image doesn't have alternative text. Screen reader users won't know what the button does.",
    fix: 'Add an "alt" attribute to the image button that describes its action (for example, "Search" or "Submit form").',
  },
  label: {
    help: "Form fields need a label",
    description:
      "A form field (like a text box, dropdown, or checkbox) doesn't have a label. Users, especially those using screen readers, won't know what information to enter or what option to select.",
    fix: "Add a visible text label next to the form field and connect it to the field using a \"for\" attribute that matches the field's ID.",
  },
  "label-content-name-mismatch": {
    help: "Visible label must match the name used by assistive tools",
    description:
      "The text label you can see on an element doesn't match what screen readers announce. This is a problem for people who use voice commands, because saying the visible label won't activate the control.",
    fix: "Make sure the text that screen readers announce includes the visible text label. The visible text should appear at the start of the announced name.",
  },
  "label-title-only": {
    help: "Form fields should have a visible label, not just a tooltip",
    description:
      "A form field only has a tooltip-style label that appears on hover, not a permanently visible label. Visible labels are easier for everyone to use and are essential for speech-control users.",
    fix: "Add a visible text label next to the form field instead of relying solely on a tooltip.",
  },
  "landmark-banner-is-top-level": {
    help: "The page banner must not be nested inside another section",
    description:
      "The page's banner area (usually containing the site logo and main navigation) is placed inside another section. Screen readers expect the banner to be at the top level of the page.",
    fix: "Move the banner region so it is a direct child of the page body, not nested inside another landmark region.",
  },
  "landmark-complementary-is-top-level": {
    help: "Sidebar content must not be nested inside another section",
    description:
      "A sidebar or supplementary content area is nested inside another section. Screen readers expect these areas to be at the top level of the page for easy navigation.",
    fix: "Move the complementary region so it is a direct child of the page body, not nested inside another landmark region.",
  },
  "landmark-contentinfo-is-top-level": {
    help: "The page footer must not be nested inside another section",
    description:
      "The page's footer area (usually containing copyright and contact info) is nested inside another section. Screen readers expect the footer to be at the top level of the page.",
    fix: "Move the footer region so it is a direct child of the page body, not nested inside another landmark region.",
  },
  "landmark-main-is-top-level": {
    help: "The main content area must not be nested inside another section",
    description:
      "The main content area is nested inside another section. Screen readers expect the main content to be at the top level of the page for easy navigation.",
    fix: "Move the main content region so it is a direct child of the page body, not nested inside another landmark region.",
  },
  "landmark-no-duplicate-banner": {
    help: "Page should have only one banner",
    description:
      "The page has more than one banner region. Screen reader users rely on there being a single banner to orient themselves on the page.",
    fix: "Remove the extra banner regions so the page has only one.",
  },
  "landmark-no-duplicate-contentinfo": {
    help: "Page should have only one footer section",
    description:
      "The page has more than one footer region. Screen reader users rely on there being a single footer to orient themselves on the page.",
    fix: "Remove the extra footer regions so the page has only one.",
  },
  "landmark-no-duplicate-main": {
    help: "Page should have only one main content area",
    description:
      "The page has more than one main content region. Screen reader users rely on there being a single main content area to find the primary content quickly.",
    fix: "Remove the extra main content regions so the page has only one.",
  },
  "landmark-one-main": {
    help: "Page needs a main content area",
    description:
      "The page doesn't have a designated main content area. Screen reader users use this landmark to jump directly to the primary content, skipping navigation and headers.",
    fix: "Wrap the page's primary content in a <main> element or add a \"main\" role to the content container.",
  },
  "landmark-unique": {
    help: "Page sections must have unique labels",
    description:
      "Multiple page sections of the same type don't have unique labels. Screen reader users can't tell them apart when navigating by landmarks.",
    fix: "Add a unique label to each section of the same type so users can distinguish between them.",
  },
  "link-in-text-block": {
    help: "Links in text must be visually distinct without relying on colour alone",
    description:
      "A link within a block of text is only distinguished from the surrounding text by its colour. People who have difficulty seeing colour differences won't be able to identify it as a link.",
    fix: "Add another visual indicator to links besides colour, such as an underline, bold text, or a border.",
  },
  "link-name": {
    help: "Links need descriptive text",
    description:
      "A link doesn't have text that describes where it goes. Screen reader users will hear \"link\" but won't know its destination or purpose.",
    fix: "Add descriptive text inside the link that explains where it leads. Avoid generic text like \"click here\" or \"read more\" — be specific about the destination.",
  },
  list: {
    help: "Lists must be structured correctly",
    description:
      "A list element contains items that aren't proper list items. This causes screen readers to misrepresent the list structure, making it harder to navigate.",
    fix: "Make sure the list only contains list item elements. Move any other elements outside the list or wrap them in list items.",
  },
  listitem: {
    help: "List items must be inside a list",
    description:
      "A list item element is not inside a list. Screen readers won't recognise it as part of a list, so users won't know it belongs to a group of items.",
    fix: "Wrap the list item inside a list element (ordered or unordered).",
  },
  marquee: {
    help: "Scrolling marquee content is not allowed",
    description:
      "Moving or scrolling marquee content is very difficult to read and cannot be paused. It is inaccessible to many users, including those with reading or attention difficulties.",
    fix: "Replace the marquee with static content, or provide a way for users to pause and control the scrolling.",
  },
  "meta-refresh": {
    help: "Page must not automatically redirect or refresh",
    description:
      "The page is set to automatically redirect or refresh after a time delay. This can disorient users, especially screen reader users who may lose their place on the page.",
    fix: "Remove the automatic redirect or refresh. If a redirect is needed, make it immediate (zero delay) or provide a link the user can click instead.",
  },
  "meta-refresh-no-exceptions": {
    help: "Page must not automatically redirect or refresh at all",
    description:
      "The page is set to automatically redirect or refresh. Even with a short delay, this can be disorienting for users and may cause them to lose unsaved work or their reading position.",
    fix: "Remove the automatic redirect or refresh entirely. Let users control navigation themselves.",
  },
  "meta-viewport": {
    help: "Users must be able to zoom the page",
    description:
      "The page prevents users from zooming in with pinch-to-zoom or limits the zoom level. People with low vision often need to zoom in to read text.",
    fix: "Remove any viewport settings that disable zooming or limit the maximum zoom level. Don't set \"user-scalable=no\" or a \"maximum-scale\" value less than 5.",
  },
  "meta-viewport-large": {
    help: "Page should allow generous zooming",
    description:
      "The page limits how much users can zoom in. People with low vision may need to zoom in significantly to read content comfortably.",
    fix: "Increase the maximum zoom level to at least 5x, or remove the maximum zoom limit entirely.",
  },
  "nested-interactive": {
    help: "Interactive elements must not be nested inside each other",
    description:
      "A clickable or interactive element is placed inside another clickable or interactive element. This makes it unclear what happens when a user clicks, and can break keyboard navigation.",
    fix: "Separate the nested interactive elements so they sit side by side rather than inside one another.",
  },
  "no-autoplay-audio": {
    help: "Audio must not play automatically",
    description:
      "Audio starts playing as soon as the page loads. This can interfere with screen readers and is startling or disruptive for many users.",
    fix: "Remove the autoplay setting so audio only plays when the user chooses to start it. If audio must autoplay, make it shorter than 3 seconds or provide a visible control to stop it.",
  },
  "object-alt": {
    help: "Embedded objects need descriptive text",
    description:
      "An embedded object (such as a plugin or interactive widget) doesn't have alternative text. Screen reader users won't know what the object is or does.",
    fix: "Add alternative text to the embedded object that describes its content or purpose.",
  },
  "p-as-heading": {
    help: "Bold text should not be used instead of proper headings",
    description:
      "A paragraph of bold or large text appears to be used as a heading, but it's not marked as one. Screen reader users navigate by headings and will miss this section entirely.",
    fix: "Change the element to a proper heading (h1 through h6) at the appropriate level instead of using bold or large text to make it look like a heading.",
  },
  "page-has-heading-one": {
    help: "Page needs a main heading",
    description:
      "The page doesn't have a top-level heading (h1). Screen reader users rely on the main heading to understand the page's topic. It's typically the first heading they navigate to.",
    fix: "Add an h1 heading near the top of the main content that describes the page's purpose or topic.",
  },
  "presentation-role-conflict": {
    help: "Element marked as decorative must not also be interactive",
    description:
      "An element is marked as decorative (meaning screen readers should ignore it), but it also has interactive features like being focusable or having a label. This creates a contradiction.",
    fix: "Either remove the decorative marking so screen readers can see the element, or remove its interactive features if it truly is decorative.",
  },
  region: {
    help: "All content should be inside a labelled page section",
    description:
      "Some content on the page is outside of any landmark section (like header, navigation, main, or footer). Screen reader users rely on these sections to navigate and may miss orphaned content.",
    fix: "Place all page content inside appropriate landmark sections such as header, nav, main, or footer.",
  },
  "role-img-alt": {
    help: "Elements used as images need descriptive text",
    description:
      "An element being used as an image (such as an icon or graphic) doesn't have alternative text. Screen reader users won't know what the image represents.",
    fix: "Add a text label to the element that describes what the image shows or means.",
  },
  "scope-attr-valid": {
    help: "Table header scope must be used correctly",
    description:
      "A table header has a scope attribute with an invalid value. The scope tells screen readers whether a header applies to a row or a column of data.",
    fix: 'Change the scope to a valid value: "row" if the header labels a row, or "col" if it labels a column.',
  },
  "scrollable-region-focusable": {
    help: "Scrollable areas must be keyboard accessible",
    description:
      "A scrollable area on the page can't be reached or scrolled with the keyboard. Keyboard-only users won't be able to access the overflowing content.",
    fix: "Make the scrollable container focusable by adding a tabindex attribute and an appropriate role, so keyboard users can focus on it and scroll with the arrow keys.",
  },
  "select-name": {
    help: "Dropdown menus need a label",
    description:
      "A dropdown select menu doesn't have a label. Screen reader users won't know what choices the dropdown contains or what they're selecting.",
    fix: "Add a visible text label next to the dropdown and connect it to the select element.",
  },
  "server-side-image-map": {
    help: "Server-side image maps should not be used",
    description:
      "A server-side image map sends click coordinates to the server to determine what action to take. Keyboard users can't use these, and screen reader users have no way to know what the clickable areas are.",
    fix: "Replace the server-side image map with a client-side image map (which can have text descriptions for each area) or with individual links.",
  },
  "skip-link": {
    help: "\"Skip to content\" link must work correctly",
    description:
      "A \"skip to content\" link exists but it doesn't work properly. It may point to a destination that doesn't exist or that isn't focusable. This defeats the purpose of helping keyboard users skip past navigation.",
    fix: "Make sure the skip link points to a valid element on the page (usually the main content area) and that the target element can receive focus.",
  },
  "summary-name": {
    help: "Expandable summary elements need a label",
    description:
      "A summary element (the clickable header of an expandable section) doesn't have text content. Users won't know what the section contains or what will be revealed when they click it.",
    fix: "Add descriptive text inside the summary element that explains what the expandable section contains.",
  },
  "svg-img-alt": {
    help: "SVG images need descriptive text",
    description:
      "An SVG image (a type of graphic) doesn't have alternative text. Screen reader users won't know what the image shows.",
    fix: "Add a title element inside the SVG, or add a text label to the SVG element that describes what the graphic shows.",
  },
  tabindex: {
    help: "Elements should not have a tabindex greater than zero",
    description:
      "An element has a tabindex value greater than zero, which forces it to appear earlier in the keyboard tab order. This overrides the natural reading order and creates a confusing navigation experience.",
    fix: "Change the tabindex to 0 (to keep the natural order) or -1 (to remove it from the tab order entirely). Rearrange elements in the page source if a different tab order is needed.",
  },
  "table-duplicate-name": {
    help: "Table's visible text and summary should not be identical",
    description:
      "A table has a caption (visible title) and a summary that contain the same text. Screen reader users will hear the same information repeated.",
    fix: "Make the caption and summary different. Use the caption for a short title and the summary for a more detailed explanation of the table's structure.",
  },
  "table-fake-caption": {
    help: "Tables should use a proper caption instead of a fake one",
    description:
      "A table uses a regular cell spanning all columns to act as a title, instead of a proper table caption. Screen readers won't recognise it as the table's title.",
    fix: "Replace the spanning cell with a proper <caption> element inside the table to serve as the table's title.",
  },
  "target-size": {
    help: "Clickable areas must be large enough to tap easily",
    description:
      "A clickable element (button, link, or control) is too small for users to tap or click comfortably. Small targets are especially difficult for people with limited fine motor skills or those using touchscreens.",
    fix: "Make the clickable area at least 24 by 24 pixels. This can be done by increasing padding, using larger text, or setting a minimum size on the element.",
  },
  "td-has-header": {
    help: "Data table cells need associated headers",
    description:
      "A data cell in a table doesn't have an associated header. Screen reader users rely on headers to understand what each cell's data means as they navigate the table.",
    fix: "Add header cells to the table's rows or columns and make sure data cells are properly associated with them.",
  },
  "td-headers-attr": {
    help: "Table cell header references must be valid",
    description:
      "A table cell references a header by ID, but that ID doesn't point to a valid header cell in the same table. Screen readers won't be able to announce the correct header for this cell.",
    fix: "Fix the header references so each data cell points to valid header cell IDs within the same table.",
  },
  "th-has-data-cells": {
    help: "Table headers must be associated with data cells",
    description:
      "A table header cell doesn't have any data cells associated with it. This suggests the table structure may be incorrect or the header is unnecessary.",
    fix: "Check the table structure and make sure each header cell has corresponding data cells. Remove any headers that don't describe any data.",
  },
  "valid-lang": {
    help: "Language codes on elements must be valid",
    description:
      "An element specifies a language using an invalid language code. Screen readers use language codes to switch pronunciation rules, so an invalid code may cause garbled speech.",
    fix: 'Change the language attribute to a valid language code (for example, "en" for English, "fr" for French, "es" for Spanish).',
  },
  "text-in-image": {
    help: "Some images on this page may contain text",
    description:
      "When images contain text, people who need to resize text, change fonts, or use screen readers may not be able to access the information. Use real text styled with CSS instead, unless the image is a logo or the specific appearance is essential.",
    fix: "Replace each flagged image with real HTML text. If the image is a logo or the text presentation is essential, ensure it has appropriate alt text describing the content.",
  },
  "video-caption": {
    help: "Videos need captions",
    description:
      "A video doesn't have captions. People who are deaf or hard of hearing need captions to access the spoken content. Captions also help people watching in noisy or quiet environments.",
    fix: "Add captions to the video. Use closed captions (which viewers can toggle on and off) for the best experience.",
  },
};

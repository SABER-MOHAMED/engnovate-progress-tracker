# IELTS Test Completion Tracker Chrome Extension

This Chrome extension adds visual completion tags to IELTS test cards on engnovate.com, helping users quickly identify which tests they've already completed.

## Features

- **Visual Completion Status**: Adds green "✓ COMPLETED" or gray "○ NOT TAKEN" tags to test cards
- **Automatic Detection**: Reads from localStorage to determine completion status
- **Dynamic Updates**: Works with dynamically loaded content
- **Responsive Design**: Adapts to different screen sizes

## How It Works

The extension:
1. Scans the page for IELTS test cards
2. Extracts the test path from each card
3. Checks localStorage for completed test data (format: `/ielts-reading-tests/test-path/`)
4. Adds appropriate completion tags to each card

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will now be active on engnovate.com

## File Structure

```
├── manifest.json       # Extension configuration
├── content.js         # Main logic for detecting and tagging tests
├── styles.css         # Styling for completion tags
└── README.md          # This file
```

## localStorage Format

The extension expects localStorage entries in this format:
- **Key**: `/ielts-reading-tests/cambridge-ielts-20-academic-reading-test-4/`
- **Value**: `["teacher","charcoal","skyscrapers",...]` (array of answers)

## Customization

### Tag Styles
Modify `styles.css` to change:
- Colors and gradients
- Position (top-right, bottom-right, top-left)
- Size and typography
- Animation effects

### Test Detection
Update `content.js` to:
- Add support for different test formats
- Modify the localStorage key matching logic
- Change tag text or behavior

## Troubleshooting

### Tags Not Appearing
1. Check if the page structure matches expected selectors
2. Verify localStorage contains test data
3. Check browser console for errors

### Wrong Completion Status
1. Ensure localStorage keys match the expected format
2. Check if test paths are being extracted correctly
3. Verify the localStorage data isn't corrupted

## Development

To modify the extension:
1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh button on the extension card
4. Reload the target webpage to see changes

## Browser Support

- Chrome (Manifest V3)
- Other Chromium-based browsers (Edge, Brave, etc.)

## Privacy

This extension:
- Only runs on engnovate.com
- Only accesses localStorage data
- Does not send any data externally
- Does not track user behavior
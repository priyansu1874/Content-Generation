# Smart Button Logic Implementation

## Overview
This implementation provides smart button logic for the 3-page article generation workflow:
- Page 1: Blog form with user inputs
- Page 2: Final prompt review and editing (PromptPreview component)
- Page 3: Generated content validation and preview (ArticleOutput component)

## Context Management (`ArticleContext.tsx`)

### Global State
- `hasGeneratedOnce`: Global flag - has Generate ever been clicked in this session
- `hasGeneratedInThisSession`: Local flag - tracks current page session
- `lastGeneratedPrompt`: String - stores the exact prompt used for last generation
- `isComingFromValidation`: Boolean - tracks if user came from Page 3
- `generatedContent`: String - stores the generated article content
- `currentPrompt`: String - tracks the current prompt text

### Key Functions
- `markAsGenerated(prompt)`: Called when generation completes
- `setComingFromValidation(true)`: Called when navigating from Page 3 to Page 2
- `setPrompt(prompt)`: Updates current prompt in real-time
- `resetSession()`: Resets session flags when starting fresh

## Button Logic (Page 2 - PromptPreview)

### Generate Button
**ENABLED when:**
- Coming from Page 1 with valid prompt text
- User edits prompt (currentPrompt ≠ lastGeneratedPrompt)

**DISABLED when:**
- Coming from Page 3 (isComingFromValidation = true)
- Content already generated with current prompt
- Prompt is empty

**Visual feedback:**
- Opacity reduced to 50% when disabled
- Cursor changes to not-allowed
- Status indicator shows reason for disable state

### Next Page Button
**ENABLED when:**
- Content has been generated (hasGeneratedOnce = true)
- Generated content exists in context

**DISABLED when:**
- No content generated yet
- Generated content is empty

**Behavior:**
- Never regenerates content
- Only navigates to Page 3
- Preserves existing generated content

## Navigation Flow

### Page 1 → Page 2
- Calls `resetSession()` to clear flags
- Generate: ENABLED (if prompt exists)
- Next Page: DISABLED (no content yet)

### After Generate Click
- Stores prompt as `lastGeneratedPrompt`
- Sets `hasGeneratedOnce = true`
- Sets `hasGeneratedInThisSession = true`
- Generate: DISABLED
- Next Page: ENABLED

### Page 3 → Page 2
- Sets `isComingFromValidation = true`
- Auto-sets `lastGeneratedPrompt = currentPrompt`
- Generate: DISABLED
- Next Page: ENABLED

### When User Edits Prompt
- If `currentPrompt ≠ lastGeneratedPrompt`: Generate becomes ENABLED
- Next Page stays ENABLED (previous content still valid)

## Content Persistence
- Generated content stored in global context
- Navigation between Page 2 ↔ Page 3 preserves content
- Content only cleared when Generate is clicked again
- No regeneration on navigation alone

## User Experience Features

### Visual Feedback
- Disabled buttons show reduced opacity (50%)
- Status indicators explain button states
- Loading states during generation
- Clear visual hierarchy

### Smart State Management
- Prevents accidental duplicate generations
- Forces content generation before Page 3 access
- Allows free navigation once content exists
- Preserves user edits during navigation

### Error Handling
- API call error handling
- Loading state management
- Validation of required fields

## Technical Implementation

### React Hooks Used
- `useState` for local component state
- `useEffect` for navigation detection
- `useContext` for global state access

### TypeScript Interfaces
- Proper type safety for all state variables
- Interface definitions for context and props
- Type checking for button logic functions

## API Integration
- Generate button makes POST request to webhook
- Request includes form data + final prompt
- Response stored for Page 3 display
- Proper error handling and loading states

This implementation ensures a controlled workflow where users must generate content before proceeding, prevents unnecessary API calls, and maintains excellent user experience through smart state persistence.

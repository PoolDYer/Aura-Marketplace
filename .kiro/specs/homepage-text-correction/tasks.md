# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Hero Text Contains "reales"
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For this deterministic bug, scope the property to the concrete case: HomePage hero heading text
  - Test that the hero heading text in HomePage.tsx (line 154) equals "Explora productos reales publicados en Aura."
  - Test that the text includes the word "reales" between "productos" and "publicados"
  - Verify the bug exists on UNFIXED code across desktop and mobile viewports
  - The test assertions should match the Expected Behavior Properties from design: text should be "Explora productos publicados en Aura." without "reales"
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: actual text contains "reales" when it should not
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Styling and Functionality Preservation
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy elements (CSS classes, responsive behavior, other hero elements, page functionality)
  - Write tests capturing observed behavior patterns from Preservation Requirements:
    - CSS classes preservation: verify `h1` element has exact classes `max-w-4xl font-auth-display text-[32px] font-bold leading-tight tracking-tight text-[#845400] md:text-[56px] md:leading-[64px]`
    - Responsive behavior: verify text adapts correctly in desktop (≥768px) and mobile (<768px) viewports
    - Other hero elements: verify badge text "Catalogo conectado a la base de datos." and paragraph text remain unchanged
    - Page functionality: verify search, navigation, product clicks, cart operations work correctly
  - Visual regression test: capture screenshot of complete HomePage to compare after fix
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for Hero Text - Remove "reales" word

  - [x] 3.1 Implement the fix
    - Navigate to `frontend/src/pages/HomePage.tsx` line 154
    - Locate the `h1` element with the hero heading text
    - Change text from "Explora productos reales publicados en Aura." to "Explora productos publicados en Aura."
    - Remove the word "reales " (including the trailing space)
    - DO NOT modify any attributes, classes, or properties of the `h1` element
    - Verify the change is only in the text content, no other modifications
    - _Bug_Condition: isBugCondition(input) where input.heroHeading.textContent == "Explora productos reales publicados en Aura." AND input.heroHeading.includes("reales")_
    - _Expected_Behavior: Hero heading text SHALL be "Explora productos publicados en Aura." without the word "reales" (Property 1 from design)_
    - _Preservation: All CSS classes, responsive behavior, other hero elements, and page functionality SHALL remain identical (Property 2 from design)_
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Hero Text Simplification
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - Verify that hero heading text is "Explora productos publicados en Aura."
    - Verify that text does NOT contain the word "reales"
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Styling and Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - Verify CSS classes of `h1` element remain identical
    - Verify responsive behavior unchanged (desktop and mobile viewports)
    - Verify other hero elements (badge, paragraph) unchanged
    - Verify page functionality (search, navigation, cart) works correctly
    - Compare visual regression screenshots: only hero text should differ
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run all tests (bug condition + preservation tests)
  - Verify bug condition test passes (hero text is correct)
  - Verify preservation tests pass (no regressions)
  - Perform visual inspection in browser: verify hero text displays "Explora productos publicados en Aura." on both desktop and mobile
  - Ensure all tests pass, ask the user if questions arise

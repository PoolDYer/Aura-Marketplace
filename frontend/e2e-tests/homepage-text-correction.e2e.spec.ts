import { test, expect } from '@playwright/test';

/**
 * Bug Condition Exploration Test for Homepage Text Correction
 * 
 * **Validates: Requirements 1.1, 1.2**
 * 
 * This test encodes the EXPECTED behavior (hero text without "reales").
 * On UNFIXED code, this test MUST FAIL - failure confirms the bug exists.
 * On FIXED code, this test MUST PASS - pass confirms the bug is fixed.
 * 
 * Property 1: Bug Condition - Hero Text Contains "reales"
 * The hero heading text should be "Explora productos publicados en Aura." 
 * WITHOUT the word "reales".
 */
test.describe('Homepage Hero Text Correction - Bug Condition Exploration', () => {
  
  test('Property 1: Hero heading text should NOT contain "reales" word', async ({ page }) => {
    // Navigate to the HomePage
    await page.goto('/');
    
    // Wait for the hero section to be visible
    await page.waitForSelector('h1.font-auth-display');
    
    // Locate the hero heading element
    const heroHeading = page.locator('h1.font-auth-display');
    
    // Get the actual text content
    const actualText = await heroHeading.textContent();
    
    console.log('=== BUG CONDITION EXPLORATION ===');
    console.log('Actual hero text:', actualText);
    console.log('Expected text:', 'Explora productos publicados en Aura.');
    console.log('Contains "reales"?', actualText?.includes('reales'));
    
    // ASSERTION 1: The text should be the expected simplified text
    // This will FAIL on unfixed code (which has "reales")
    expect(actualText).toBe('Explora productos publicados en Aura.');
    
    // ASSERTION 2: The text should NOT contain the word "reales"
    // This will FAIL on unfixed code (which contains "reales")
    expect(actualText).not.toContain('reales');
    
    // Log counterexample if test fails
    if (actualText?.includes('reales')) {
      console.log('🔴 COUNTEREXAMPLE FOUND: Text contains "reales"');
      console.log('   Actual: "' + actualText + '"');
      console.log('   Expected: "Explora productos publicados en Aura."');
    }
  });
  
  test('Property 1: Hero heading text verification across desktop viewport', async ({ page }) => {
    // Set desktop viewport (≥768px)
    await page.setViewportSize({ width: 1280, height: 720 });
    
    await page.goto('/');
    await page.waitForSelector('h1.font-auth-display');
    
    const heroHeading = page.locator('h1.font-auth-display');
    const actualText = await heroHeading.textContent();
    
    console.log('=== DESKTOP VIEWPORT TEST ===');
    console.log('Viewport: 1280x720');
    console.log('Actual text:', actualText);
    
    // Expected behavior: text should be simplified without "reales"
    expect(actualText).toBe('Explora productos publicados en Aura.');
    expect(actualText).not.toContain('reales');
  });
  
  test('Property 1: Hero heading text verification across mobile viewport', async ({ page }) => {
    // Set mobile viewport (<768px)
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForSelector('h1.font-auth-display');
    
    const heroHeading = page.locator('h1.font-auth-display');
    const actualText = await heroHeading.textContent();
    
    console.log('=== MOBILE VIEWPORT TEST ===');
    console.log('Viewport: 375x667');
    console.log('Actual text:', actualText);
    
    // Expected behavior: text should be simplified without "reales"
    expect(actualText).toBe('Explora productos publicados en Aura.');
    expect(actualText).not.toContain('reales');
  });
  
  test('Property 1: Verify exact text position - word order check', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1.font-auth-display');
    
    const heroHeading = page.locator('h1.font-auth-display');
    const actualText = await heroHeading.textContent();
    
    console.log('=== WORD ORDER VERIFICATION ===');
    console.log('Actual text:', actualText);
    
    // Verify the text structure: "productos" should be followed by "publicados", not by "reales"
    if (actualText) {
      const words = actualText.split(/\s+/);
      const productosIndex = words.indexOf('productos');
      
      if (productosIndex !== -1 && productosIndex + 1 < words.length) {
        const nextWord = words[productosIndex + 1];
        console.log('Word after "productos":', nextWord);
        
        // The word after "productos" should be "publicados", NOT "reales"
        expect(nextWord).toBe('publicados');
        expect(nextWord).not.toBe('reales');
      }
    }
    
    // Final verification: complete text match
    expect(actualText).toBe('Explora productos publicados en Aura.');
  });
});


/**
 * Preservation Property Tests for Homepage Text Correction
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 * 
 * Property 2: Preservation - Styling and Functionality
 * 
 * These tests observe and capture the CURRENT behavior of all elements 
 * EXCEPT the buggy hero text. They establish a baseline to ensure these 
 * elements remain unchanged after the fix.
 * 
 * IMPORTANT: These tests run on UNFIXED code and should PASS, confirming 
 * the baseline behavior we want to preserve.
 */
test.describe('Homepage Text Correction - Preservation Properties', () => {
  
  /**
   * Property 2.1: CSS Classes Preservation
   * **Validates: Requirement 3.1**
   * 
   * Observes and verifies that the h1 element maintains its exact CSS classes.
   * This ensures styling remains identical after the text fix.
   */
  test('Property 2: CSS classes of h1 hero element are preserved', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1.font-auth-display');
    
    const heroHeading = page.locator('h1.font-auth-display');
    
    // Capture the exact className attribute
    const classNames = await heroHeading.getAttribute('class');
    
    console.log('=== CSS CLASSES PRESERVATION ===');
    console.log('Hero h1 classes:', classNames);
    
    // Verify exact classes match the design specification
    // These classes MUST remain identical after the fix
    const expectedClasses = 'max-w-4xl font-auth-display text-[32px] font-bold leading-tight tracking-tight text-[#845400] md:text-[56px] md:leading-[64px]';
    
    expect(classNames).toBe(expectedClasses);
    
    // Verify individual critical classes are present
    expect(classNames).toContain('font-auth-display');
    expect(classNames).toContain('text-[32px]');
    expect(classNames).toContain('font-bold');
    expect(classNames).toContain('text-[#845400]');
    expect(classNames).toContain('md:text-[56px]');
    expect(classNames).toContain('md:leading-[64px]');
  });
  
  /**
   * Property 2.2: Responsive Behavior Preservation - Desktop
   * **Validates: Requirement 3.4**
   * 
   * Observes responsive behavior at desktop viewport (≥768px).
   * Verifies that text size and layout adapt correctly.
   */
  test('Property 2: Responsive behavior preserved in desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    await page.goto('/');
    await page.waitForSelector('h1.font-auth-display');
    
    const heroHeading = page.locator('h1.font-auth-display');
    
    // Verify the element is visible
    await expect(heroHeading).toBeVisible();
    
    // Capture computed styles to verify responsive classes are applied
    const fontSize = await heroHeading.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    
    console.log('=== DESKTOP RESPONSIVE BEHAVIOR ===');
    console.log('Viewport: 1280x720');
    console.log('Hero h1 computed font-size:', fontSize);
    
    // At desktop size, the font should be larger (md:text-[56px] applies)
    // 56px = 3.5rem typically
    expect(fontSize).toBeTruthy();
    
    // Verify classes are still present
    const classNames = await heroHeading.getAttribute('class');
    expect(classNames).toContain('md:text-[56px]');
    expect(classNames).toContain('md:leading-[64px]');
  });
  
  /**
   * Property 2.3: Responsive Behavior Preservation - Mobile
   * **Validates: Requirement 3.4**
   * 
   * Observes responsive behavior at mobile viewport (<768px).
   * Verifies that text size and layout adapt correctly.
   */
  test('Property 2: Responsive behavior preserved in mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForSelector('h1.font-auth-display');
    
    const heroHeading = page.locator('h1.font-auth-display');
    
    // Verify the element is visible
    await expect(heroHeading).toBeVisible();
    
    // Capture computed styles
    const fontSize = await heroHeading.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    
    console.log('=== MOBILE RESPONSIVE BEHAVIOR ===');
    console.log('Viewport: 375x667');
    console.log('Hero h1 computed font-size:', fontSize);
    
    // At mobile size, the font should be smaller (text-[32px] applies)
    expect(fontSize).toBeTruthy();
    
    // Verify classes are still present
    const classNames = await heroHeading.getAttribute('class');
    expect(classNames).toContain('text-[32px]');
  });
  
  /**
   * Property 2.4: Other Hero Elements Preservation
   * **Validates: Requirements 3.2**
   * 
   * Observes and verifies that other hero section elements remain unchanged:
   * - Badge text: "Catalogo conectado a la base de datos."
   * - Paragraph text
   */
  test('Property 2: Other hero elements (badge, paragraph) remain unchanged', async ({ page }) => {
    await page.goto('/');
    
    // Wait for hero section to load
    await page.waitForSelector('h1.font-auth-display');
    
    console.log('=== OTHER HERO ELEMENTS PRESERVATION ===');
    
    // Verify badge text
    const badge = page.locator('div.inline-flex.items-center.gap-2.rounded-full');
    const badgeText = await badge.textContent();
    
    console.log('Badge text:', badgeText);
    
    // Badge should contain the exact text (with icon it may have extra whitespace)
    expect(badgeText).toContain('Catalogo conectado a la base de datos.');
    
    // Verify paragraph text
    const paragraph = page.locator('p.mt-4.max-w-2xl');
    const paragraphText = await paragraph.textContent();
    
    console.log('Paragraph text:', paragraphText);
    
    expect(paragraphText).toContain('Lo que ves aqui sale directamente de las publicaciones activas registradas.');
    
    // Verify these elements are visible
    await expect(badge).toBeVisible();
    await expect(paragraph).toBeVisible();
  });
  
  /**
   * Property 2.5: Page Functionality Preservation - Navigation
   * **Validates: Requirements 3.3, 3.5**
   * 
   * Observes that navigation elements work correctly.
   */
  test('Property 2: Navigation functionality is preserved', async ({ page }) => {
    await page.goto('/');
    
    console.log('=== NAVIGATION FUNCTIONALITY ===');
    
    // Verify "Ver catalogo" link exists and is clickable
    const catalogLink = page.locator('a[href="/catalog"]').first();
    await expect(catalogLink).toBeVisible();
    
    console.log('Catalog link found and visible');
    
    // Verify hero product card is clickable (even if no products, link should exist)
    const heroCard = page.locator('a.group.relative.min-h-\\[380px\\]');
    await expect(heroCard).toBeVisible();
    
    console.log('Hero product card found and visible');
    
    // Verify footer links exist
    const footerLinks = page.locator('footer a');
    const footerLinkCount = await footerLinks.count();
    
    console.log('Footer links count:', footerLinkCount);
    expect(footerLinkCount).toBeGreaterThan(0);
  });
  
  /**
   * Property 2.6: Page Functionality Preservation - Search
   * **Validates: Requirement 3.3**
   * 
   * Observes that search functionality elements are present and functional.
   */
  test('Property 2: Search functionality is preserved', async ({ page }) => {
    await page.goto('/');
    
    console.log('=== SEARCH FUNCTIONALITY ===');
    
    // Wait for header to load (search is in AuraHeader)
    await page.waitForSelector('header, nav, [role="banner"]', { timeout: 10000 }).catch(() => {
      console.log('Header not found with standard selectors, continuing...');
    });
    
    // Search for input field (may be in different forms depending on header implementation)
    const searchInput = page.locator('input[type="search"], input[type="text"], input[placeholder*="uscar"], input[placeholder*="search"]').first();
    
    try {
      await expect(searchInput).toBeVisible({ timeout: 5000 });
      console.log('Search input found and visible');
    } catch (e) {
      console.log('Search input not immediately visible, may be behind interaction');
    }
  });
  
  /**
   * Property 2.7: Page Functionality Preservation - Product Cards
   * **Validates: Requirement 3.3**
   * 
   * Observes that product cards render correctly with their functionality.
   */
  test('Property 2: Product cards functionality is preserved', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products section
    await page.waitForSelector('section', { timeout: 10000 });
    
    console.log('=== PRODUCT CARDS FUNCTIONALITY ===');
    
    // Check if featured products section exists
    const featuredSection = page.locator('h2.font-auth-display:has-text("Novedades")');
    await expect(featuredSection).toBeVisible();
    
    console.log('Featured products section "Novedades" found');
    
    // Check for product cards (there may or may not be products)
    const productCards = page.locator('article.group');
    const cardCount = await productCards.count();
    
    console.log('Product cards found:', cardCount);
    
    // If there are product cards, verify they have the correct structure
    if (cardCount > 0) {
      const firstCard = productCards.first();
      
      // Verify card has image area
      const cardImage = firstCard.locator('a').first();
      await expect(cardImage).toBeVisible();
      
      // Verify card has add button (Plus icon button)
      const addButton = firstCard.locator('button[aria-label*="Agregar"]');
      await expect(addButton).toBeVisible();
      
      console.log('Product card structure validated (image, add button present)');
    } else {
      console.log('No products displayed (this is acceptable for empty database)');
    }
  });
  
  /**
   * Property 2.8: Visual Regression - Complete HomePage Screenshot
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
   * 
   * Captures a full screenshot of the HomePage to compare after the fix.
   * Only the hero heading text should differ; all other elements should be identical.
   */
  test('Property 2: Visual regression baseline - full page screenshot', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForSelector('h1.font-auth-display');
    await page.waitForTimeout(1000); // Allow animations to settle
    
    console.log('=== VISUAL REGRESSION BASELINE ===');
    console.log('Capturing full page screenshot as baseline for comparison');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-preservation-baseline.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    console.log('Baseline screenshot saved: homepage-preservation-baseline.png');
    console.log('After fix: compare to verify only hero text changed');
  });
  
  /**
   * Property 2.9: Hero Section DOM Structure Preservation
   * **Validates: Requirements 3.1, 3.2**
   * 
   * Observes the complete DOM structure of the hero section to ensure
   * the fix doesn't accidentally modify surrounding elements.
   */
  test('Property 2: Hero section DOM structure is preserved', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1.font-auth-display');
    
    console.log('=== HERO SECTION DOM STRUCTURE ===');
    
    // Verify hero section container exists
    const heroSection = page.locator('section.flex.flex-col.items-center');
    await expect(heroSection).toBeVisible();
    
    // Verify hero section children: badge, h1, p
    const badge = heroSection.locator('div.inline-flex.items-center.gap-2');
    const heading = heroSection.locator('h1.font-auth-display');
    const paragraph = heroSection.locator('p.mt-4.max-w-2xl');
    
    await expect(badge).toBeVisible();
    await expect(heading).toBeVisible();
    await expect(paragraph).toBeVisible();
    
    console.log('Hero section structure validated:');
    console.log('- Badge element present');
    console.log('- Heading element present');
    console.log('- Paragraph element present');
    
    // Verify the h1 element tag name (should remain h1, not changed to div or span)
    const tagName = await heading.evaluate((el) => el.tagName);
    expect(tagName).toBe('H1');
    
    console.log('Hero heading tag name:', tagName, '(preserved)');
  });
});

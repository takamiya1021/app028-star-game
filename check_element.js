const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1024, height: 768 }
  });
  await page.goto('http://172.22.157.213:3001');
  await page.waitForTimeout(3000);
  
  // スクリーンショット全体
  await page.screenshot({ path: 'fullpage.png' });
  
  // 表示情報のDIVを検索
  const elements = await page.locator('p:has-text("現在の空")').all();
  console.log('要素数:', elements.length);
  
  if (elements.length > 0) {
    const parent = await elements[0].locator('..').first();
    const box = await parent.boundingBox();
    
    if (box) {
      console.log('=== 表示情報DIVのサイズ ===');
      console.log('Width:', box.width, 'px');
      console.log('Height:', box.height, 'px');
      console.log('X:', box.x);
      console.log('Y:', box.y);
      
      await parent.screenshot({ path: 'element.png' });
    }
  }
  
  await browser.close();
})();

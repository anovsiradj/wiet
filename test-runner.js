const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

class WietExampleTester {
  constructor() {
    this.results = [];
  }

  async runTests() {
    console.log('🧪 Starting Wiet Examples Tests\n');
    
    const examplesDir = path.join(process.cwd(), 'examples');
    const exampleFiles = (await fs.readdir(examplesDir))
      .filter(function(file) {
        return file.endsWith('.html') && file !== 'source.html' && file !== 'footer.html' && file !== 'komplet.html' && file !== 'slot-test.html';
      })
      .sort()
      .map(function(file) {
        return path.join('examples', file);
      });
    
    console.log(`📄 Found ${exampleFiles.length} example files`);
    
    for (const exampleFile of exampleFiles) {
      console.log(`📄 Testing ${exampleFile}...`);
      await this.testExample(exampleFile);
    }
    
    this.printResults();
    this.saveResults();
    
    const passed = this.results.filter(function(r) {
      return r.passed;
    }).length;
    const total = this.results.length;
    
    console.log(`\n✅ Tests completed: ${passed}/${total} passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('❌ Some tests failed');
      process.exit(1);
    }
  }

  async testExample(exampleFile) {
    const fullPath = path.join(process.cwd(), exampleFile);
    let content;
    
    try {
      content = await fs.readFile(fullPath, 'utf8');
    } catch (error) {
      this.addResult(exampleFile, false, `Failed to read file: ${error.message}`);
      return;
    }
    
    const testName = this.extractTestName(content);
    const checks = [];
    
    try {
      const $ = cheerio.load(content);
      
      checks.push(await this.checkBasicStructure($, exampleFile));
      checks.push(await this.checkComponentDefinitions($, exampleFile));
      checks.push(await this.checkComponentUsage($, exampleFile));
      checks.push(await this.checkJavaScriptFunctionality($, exampleFile));
      
      const allPassed = checks.every(function(check) {
        return check.passed;
      });
      const errors = checks.filter(function(check) {
        return !check.passed;
      }).map(function(check) {
        return check.error;
      });
      
      this.addResult(exampleFile, allPassed, errors.join('\n') || 'All checks passed', testName);
      
    } catch (error) {
      this.addResult(exampleFile, false, `Test execution error: ${error.message}`, testName);
    }
  }

  extractTestName(content) {
    const match = content.match(/<title>(.*?)<\/title>/);
    return match ? match[1] : 'Unknown';
  }

  async checkBasicStructure($, exampleFile) {
    try {
      const hasHead = $('head').length > 0;
      const hasBody = $('body').length > 0;
      
      if (!hasHead || !hasBody) {
        return { passed: false, error: 'Missing HTML head or body elements' };
      }
      
      return { passed: true };
    } catch (error) {
      return { passed: false, error: `Basic structure check failed: ${error.message}` };
    }
  }

  async checkComponentDefinitions($, exampleFile) {
    try {
      const scriptTags = $('script[type="module"]').length;
      const hasWietImport = $('script[type="module"]').text().includes('wiet') || 
                           $('script').text().includes('wiet');
      
      if (scriptTags === 0) {
        return { passed: false, error: 'No module scripts found' };
      }
      
      return { passed: true };
    } catch (error) {
      return { passed: false, error: `Component definitions check failed: ${error.message}` };
    }
  }

  async checkComponentUsage($, exampleFile) {
    try {
      const hasCustomElements = $('greeting-card, shadow-button, user-card, product-card, counter-widget, lifecycle-demo, card-component, dialog-component, article-component, icon-button, score-badge, product-item, cart-panel, todo-app, example-section, event-log, page-source, page-header, page-footer, feature-card, example-card').length > 0;
      
      if (!hasCustomElements) {
        return { passed: false, error: 'No custom elements found in HTML' };
      }
      
      return { passed: true };
    } catch (error) {
      return { passed: false, error: `Component usage check failed: ${error.message}` };
    }
  }

  async checkJavaScriptFunctionality($, exampleFile) {
    try {
      const scriptContent = $('script').text();
      const hasWietFunctions = scriptContent.includes('wietDefine') || 
                               scriptContent.includes('wietCreate') || 
                               scriptContent.includes('wiet') ||
                               scriptContent.includes('WietClass');
      
      if (!hasWietFunctions) {
        return { passed: false, error: 'No Wiet functionality found in JavaScript' };
      }
      
      return { passed: true };
    } catch (error) {
      return { passed: false, error: `JavaScript functionality check failed: ${error.message}` };
    }
  }

  addResult(exampleFile, passed, error, testName = null) {
    this.results.push({
      file: exampleFile,
      passed,
      error,
      testName
    });
  }

  printResults() {
    console.log('\n📊 Test Results:\n');
    
    this.results.forEach(function(result) {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.file} - ${result.testName || 'Test'}`);
      
      if (!result.passed) {
        console.log(`   Error: ${result.error}`);
      }
    });
  }

  saveResults() {
    const reportPath = path.join(process.cwd(), 'test-results.json');
    fs.writeJsonSync(reportPath, this.results, { spaces: 2 });
    console.log(`\n📄 Test report saved to: ${reportPath}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isCI = args.includes('--ci');
  
  const tester = new WietExampleTester();
  await tester.runTests();
}

main().catch(console.error);

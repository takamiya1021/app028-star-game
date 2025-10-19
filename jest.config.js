const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // next.config.jsとテスト環境用の.envファイルが配置されたディレクトリをセット
  dir: './',
})

// Jestのカスタム設定
const customJestConfig = {
  // テスト環境をjsdomに設定（ブラウザ環境のシミュレート）
  testEnvironment: 'jest-environment-jsdom',

  // テスト実行前にセットアップファイルを実行
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // モジュール解決のパスマッピング（tsconfig.jsonと一致させる）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  testPathIgnorePatterns: ['<rootDir>/tests/e2e/'],

  // カバレッジ収集対象外のパターン
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/public/',
  ],

  // カバレッジ収集対象のファイル
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'context/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],

  // カバレッジレポートの種類
  coverageReporters: ['text', 'lcov', 'html'],
}

// Next.jsの設定とマージしたJest設定をエクスポート
module.exports = createJestConfig(customJestConfig)

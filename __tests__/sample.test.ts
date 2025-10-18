// サンプルテスト：Jest環境の動作確認用

describe('Jest環境の動作確認', () => {
  test('基本的な算術演算', () => {
    expect(1 + 1).toBe(2)
  })

  test('文字列の結合', () => {
    expect('Hello' + ' ' + 'World').toBe('Hello World')
  })

  test('配列の要素確認', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })

  test('オブジェクトの検証', () => {
    const obj = { name: 'Stellarium Quiz', version: '1.0' }
    expect(obj).toHaveProperty('name')
    expect(obj.version).toBe('1.0')
  })

  test('真偽値の確認', () => {
    expect(true).toBeTruthy()
    expect(false).toBeFalsy()
    expect(null).toBeNull()
    expect(undefined).toBeUndefined()
  })
})

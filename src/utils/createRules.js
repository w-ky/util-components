function createRules (list, baseRules = {}) {
  const rules = {}
  list.forEach(item => {
    if (item.required) {
      const before = item.type === 'input' ? '请输入' : '请选择'
      rule.push({
        required: true,
        message: item.errMsg || `${before}${item.label}`,
        trigger: `${item.type === 'input' ? 'blur' : 'change'}`
      })
    }
    if (baseRules[item.key]) {
      rule.push(...baseRules[item.key])
    }
    if (rule.length > 0) rules[item.key] = rule
  })
  return rules
}

// 配置示例
ruleList = [
  {
    label: '标识',
    key: 'code',
    type: 'input',
    required: true
  },
  {
    label: '标识1',
    key: 'code',
    type: 'select',
    required: true
  }
]

/**
 * 安全地解析JSON字符串
 * @param {string} jsonString - 要解析的JSON字符串
 * @param {*} defaultValue - 解析失败时的默认值
 * @returns {*} 解析后的对象或默认值
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  // 如果是null、undefined或空字符串，返回默认值
  if (!jsonString || jsonString === '') {
    return defaultValue;
  }
  
  // 如果已经是对象或数组，直接返回
  if (typeof jsonString === 'object') {
    return jsonString;
  }
  
  // 尝试解析JSON
  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.warn(`JSON解析失败: ${jsonString}`, error.message);
    return defaultValue;
  }
}

/**
 * 格式化产品数据，安全地解析JSON字段
 * @param {object} product - 原始产品数据
 * @returns {object} 格式化后的产品数据
 */
export function formatProduct(product) {
  return {
    ...product,
    // 安全解析images字段
    images: safeJsonParse(product.images, []),
    // 转换布尔值
    is_hot: !!product.is_hot,
    is_new: !!product.is_new,
    is_recommended: !!product.is_recommended,
    print_color: product.print_color !== null ? !!product.print_color : undefined
  };
}

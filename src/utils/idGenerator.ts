export const generateNextId = (prefix: string, existingIds: string[], padding: number = 3): string => {
  // Filter IDs that start with the prefix
  const matchingIds = existingIds.filter(id => id && id.toUpperCase().startsWith(prefix.toUpperCase()));
  
  if (matchingIds.length === 0) {
    return `${prefix}${String(1).padStart(padding, '0')}`;
  }

  // Extract the numeric part and find the maximum
  const numericParts = matchingIds.map(id => {
    const numStr = id.slice(prefix.length);
    const num = parseInt(numStr, 10);
    return isNaN(num) ? 0 : num;
  });

  const maxNum = Math.max(...numericParts);
  const nextNum = maxNum + 1;

  return `${prefix}${String(nextNum).padStart(padding, '0')}`;
};

var _ = require('underscore');
// Add in top-down algorithm
function topDownWidthAlgorithm(items) {
  // Sort the items by their height
  items.sort(function (a, b) {
    return a.width - b.width;
  });
  // 当网页放大和缩小时，有时会出现多余的图像。默认设置图片的间隙增加1px
  _.each(items, function(item){
      item.width += 1;
      item.height += 1;
  });

  // Iterate over each of the items
  var y = 0;
  items.forEach(function (item) {
    // Update the y to the current height
    item.x = 0;
    item.y = y;

    // Increment the y by the item's height
    y += item.height;
  });

  // Return the items
  // console.log(items);
  return items;
}

// Export our algorithm
module.exports = topDownWidthAlgorithm;
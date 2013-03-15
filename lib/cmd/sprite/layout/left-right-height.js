var _ = require('underscore');
function leftRightHeightAlgorithm(items) {
  // Sort the items by their width
  items.sort(function (a, b) {
    return a.height - b.height;
  });
  // 当网页放大和缩小时，有时会出现多余的图像。默认设置图片的间隙增加1px
    _.each(items, function(item){
        item.width += 1;
        item.height += 1;
    });
    
  // Iterate over each of the items
  var x = 0;
  items.forEach(function (item) {
    // Update the x to the current width
    item.x = x;
    item.y = 0;

    // Increment the x by the item's width
    x += item.width;
  });

  // Return the items
  return items;
}

// Export our algorithm
module.exports = leftRightHeightAlgorithm;
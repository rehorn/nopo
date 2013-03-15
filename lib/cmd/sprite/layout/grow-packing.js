/******************************************************************************
https://github.com/jakesgordon/bin-packing
 
 Inputs:
 ------

 blocks: array of any objects that have .w and .h attributes

 Outputs:
 -------

 marks each block that fits with a .fit attribute pointing to a
 node with .x and .y coordinates

 Example:
 -------

 var blocks = [
 { width: 100, height: 100 },
 etc
 etc
 ];

 var packer = new Packer();
 packer.fit(blocks);

 =>
blocks = [
 { width: 100, height: 100, x:0, y:0 },
 etc
 etc
 ];

 for(var n = 0 ; n < blocks.length ; n++) {
 var block = blocks[n];
 Draw(block.x, block.y, block.width, block.height);

 }

 ******************************************************************************/

var _ = require('underscore');

function Packer() {
}

Packer.prototype.pack = function(images) {
    var nodes = images.slice(0).sort(function(a, b) {
        return Math.max(b.width, b.height) - Math.max(a.width, a.height);
    });

    this.root = {x: 0, y: 0, width: nodes[0].width, height: nodes[0].height};

    nodes.forEach(function(node) {
        var space = this.find(this.root, node.width, node.height);
        var fit = space ? this.split(space, node.width, node.height) : this.grow(node.width, node.height);

        node.x = fit.x;
        node.y = fit.y;
    }, this);

    return this.root;
},

Packer.prototype.find = function(node, width, height) {
    if (node.used) {
        return this.find(node.right, width, height) || this.find(node.down, width, height);
    } else if (node.width >= width && node.height >= height) {
        return node;
    }
};

Packer.prototype.split = function(node, width, height) {
    node.used = true;
    node.down = {x: node.x, y: node.y + height, width: node.width, height: node.height - height};
    node.right = {x: node.x + width, y: node.y, width: node.width - width, height: height};

    return node;
};

Packer.prototype.grow = function(width, height) {
    var canGrowDown = this.root.width >= width;
    var canGrowRight = this.root.height >= height;

    var shouldGrowRight = canGrowRight && this.root.height >= this.root.width + width;
    var shouldGrowDown = canGrowDown && this.root.width >= this.root.height + height;

    var growRight = shouldGrowRight || (!shouldGrowDown && canGrowRight);
    var growDown = !shouldGrowRight && (shouldGrowDown || (!canGrowRight && canGrowDown));

    this.root = {
        used: true,
        x: 0,
        y: 0,
        width: this.root.width + (growRight ? width : 0),
        height: this.root.height + (growDown ? height : 0),
        down: growDown ? {x: 0, y: this.root.height, width: this.root.width, height: height} : this.root,
        right: growRight ? {x: this.root.width, y: 0, width: width, height: this.root.height} : this.root
    };

    var space = this.find(this.root, width, height);
    return space && this.split(space, width, height);
};

function growPackingAlgorithm(items) {
    // maxside ordering
    // items.sort(function (a, b) {
    //    return Math.max(a.width, a.height) - Math.max(b.width, b.height);
    // }); 
    // area ordering
    items.sort(function (a, b) {
       return a.width * a.height - b.width * b.height;
    });
    // width ordering
    // items.sort(function (a, b) {
    //    return a.width - b.width;
    // });
    // // height ordering
    // items.sort(function (a, b) {
    //    return a.height - b.height;
    // });
    // 当网页放大和缩小时，有时会出现多余的图像。默认设置图片的间隙增加1px
    _.each(items, function(item){
        item.width += 1;
        item.height += 1;
    });
    var packer = new Packer();
    packer.pack(items);
    return items;
};

module.exports = growPackingAlgorithm;

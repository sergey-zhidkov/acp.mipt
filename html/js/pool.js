(function() {

    var HEIGHT = 100;
    var WIDTH = 150;
    var CENTER_X = WIDTH / 2;
    var CENTER_Y = HEIGHT / 2;

    var COLUMN_RADIUS = 5;
    var COLUMN_RADIUS_SQUARE = 4 * COLUMN_RADIUS * COLUMN_RADIUS;

    var MARGIN = 20;
    var MARGIN_HALF = MARGIN / 2;

    var canvas = document.getElementById('canvas');
    canvas.style.height = HEIGHT * 5 + 2 * MARGIN + "px";
    canvas.style.width = WIDTH * 5 + 2 * MARGIN + "px";

    var b = JXG.JSXGraph.initBoard('canvas', {boundingbox: [0 - MARGIN, 0 - MARGIN, WIDTH + MARGIN, HEIGHT + MARGIN], axis: false, grid: false, showCopyright: false, showNavigation: false});
    var columnManager = new ColumnManager(b);

    createBoundingArea();
    registerBoardEvents();

    function createBoundingArea() {
        var p1 = b.create('point', [0, 0], {fixed: true}); // left-down
        var p2 = b.create('point', [WIDTH, 0], {fixed: true}); // right-down
        var p3 = b.create('point', [WIDTH, HEIGHT], {fixed: true}); // right-top
        var p4 = b.create('point', [0, HEIGHT], {fixed: true}); // left-top

        var top = b.create('line', [p1, p2], {straightFirst:false, straightLast:false});
        var right = b.create('line', [p2, p3], {straightFirst:false, straightLast:false});
        var bottom = b.create('line', [p3, p4], {straightFirst:false, straightLast:false});
        var left = b.create('line', [p1, p4], {straightFirst:false, straightLast:false});
    }

    function registerBoardEvents() {
        b.on('mousedown', function(event) {
            columnManager.addColumn(event);
        });
    }

    function getMouseCoords(event) {
        var absPos = JXG.getPosition(event);
        var cPos = b.getCoordsTopLeftCorner();
        var dx = absPos[0] - cPos[0];
        var dy = absPos[1] - cPos[1];
        return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], b);
    }

    function ColumnManager(board) {
        this.board = board;
        this.columns = [];
    }

    ColumnManager.prototype.addColumn = function(event) {
        var coords = getMouseCoords(event);
        if (Column.isColumnInsideBoundingArea(coords) && this.canAddColumn(coords)) {
            this.columns.push(new Column(coords));
        }
    };

    ColumnManager.prototype.canAddColumn = function(coords) {
        var column;
        for (var i = 0; i < this.columns.length; i++) {
            column = this.columns[i];
            if (column.isIntersected(coords)) {
                return false;
            }
        }
        return true;
    };

    function Column(coords) {
        this.init(coords);
    }

    Column.prototype.init = function(coords) {
        var usrX = coords.usrCoords[1];
        var usrY = coords.usrCoords[2];
        var center = b.create('point', [usrX, usrY], {fixed: true, name: '', fillColor: '#000000', strokeColor: '#000000'});
        var right = b.create('point', [usrX + COLUMN_RADIUS, usrY], {fixed: true, visible: false});
        var column = b.create('circle', [center, right], {fillColor: '#20b2aa', fillOpacity: 0.5});
        this.col = column;
    };

    Column.prototype.isIntersected = function(coords) {
        var cx = coords.usrCoords[1];
        var cy = coords.usrCoords[2];
        var x = this.col.center.X();
        var y = this.col.center.Y();

        var distance = (cx - x) * (cx - x) + (cy - y) * (cy - y);
        if (distance > COLUMN_RADIUS_SQUARE) { return false; }
        return true;
    };

    Column.isColumnInsideBoundingArea = function(coords) {
        var x = coords.usrCoords[1]; // center x;
        var y = coords.usrCoords[2]; // center y;
        var left = x - COLUMN_RADIUS;
        var right = x + COLUMN_RADIUS;
        var top = y - COLUMN_RADIUS;
        var bottom = y + COLUMN_RADIUS;

        if (left < 0) { return false; }
        if (right > WIDTH) { return false; }
        if (top < 0) { return false; }
        if (bottom > HEIGHT) { return false;}
        return true;
    };

})();
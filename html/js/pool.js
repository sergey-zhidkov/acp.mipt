(function() {

    var HEIGHT = 100;
    var WIDTH = 150;
    var CENTER_X = WIDTH / 2;
    var CENTER_Y = HEIGHT / 2;

    var EPSILON = 0.00001;

    var MARGIN = 20;
    var MARGIN_HALF = MARGIN / 2;

    var canvas = document.getElementById('canvas');
    canvas.style.height = HEIGHT * 5 + 2 * MARGIN + "px";
    canvas.style.width = WIDTH * 5 + 2 * MARGIN + "px";

    var b = JXG.JSXGraph.initBoard('canvas', {boundingbox: [0 - MARGIN, 0 - MARGIN, WIDTH + MARGIN, HEIGHT + MARGIN], axis: false, grid: false, showCopyright: false, showNavigation: false});
    var boardManager = new BoardManager(b);
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

    var Transformation = {
        TR1: {
            transform: function(x, y) {
                return [x, y];
            },
            inverse: function(x, y) {
                return [x, y];
            }
        },
        TR2: {
            transform: function(x, y) {
                return [HEIGHT - y, x];
            },
            inverse: function(x, y) {
                return [y, HEIGHT - x];
            }
        },
        TR3: {
            transform: function(x, y) {
                return [WIDTH - x, HEIGHT - y];
            },
            inverse: function(x, y) {
                return [WIDTH - x, HEIGHT - y];
            }
        },
        TR4: {
            transform: function(x, y) {
                return [y, WIDTH - x];
            },
            inverse: function(x, y) {
                return [WIDTH - y, x];
            }
        }

    };

    function BoardManager(board) {
        this.board = board;
        this.circles = [];
    }

    BoardManager.prototype.computeAndAddCircles = function(columns) {
        this.removeAllCircles();
        var circles = this.circles;
        // first case - two tangents and one column
        columns.forEach(function(column) {
            Array.prototype.push.apply(circles, Computer.computeFirstCase(column));
        });

        // second case - two columns and tangent
        var i, j;
        var column1, column2;
        if (columns.length > 1) {
            for (i = 0; i < columns.length; i++) {
                column1 = columns[i];
                for (j = i + 1; j < columns.length; j++) {
                    column2 = columns[j];
                    Array.prototype.push.apply(circles, Computer.computeSecondCase(column1, column2, Transformation.TR1));
                    Array.prototype.push.apply(circles, Computer.computeSecondCase(column1, column2, Transformation.TR2));
                    Array.prototype.push.apply(circles, Computer.computeSecondCase(column1, column2, Transformation.TR3));
                    Array.prototype.push.apply(circles, Computer.computeSecondCase(column1, column2, Transformation.TR4));
                }
            }
        }

        Array.prototype.push.apply(circles, Computer.computeThirdCase(columns));

        this.findMaximumCircleAndHighlightIt();
    };

    BoardManager.prototype.findMaximumCircleAndHighlightIt = function() {
        var maxCircleRadius = 0;
        var maxCircle = null;
        var circle;
        var radius;
        for (var i = 0; i < this.circles.length; i++) {
            circle = this.circles[i];
            radius = circle.r;
            if (radius > maxCircleRadius) {
                maxCircleRadius = radius;
                maxCircle = circle;
            }
        }

        if (maxCircle !== null) {
            maxCircle.circle.setProperty({strokeColor: '#ff0000', strokeWidth: 2, fillColor: '#6495ed', fillOpacity: 0.3, dash: 0});
        }
    };

    BoardManager.prototype.removeAllCircles = function() {
        this.circles.forEach(function(circle) {
            circle.remove();
        });
        this.circles = [];
    };

    function Computer() {

    }

    Computer.computeFirstCase = function(column) {
        var circles = [];


        //**** TOP-LEFT CIRCLE
        var cx = column.X();
        var cy = column.Y();
        var x, y;

        // D = b^2 - 4ac
        var a = 1;
        var b = -2 * (cx + cy + Column.RADIUS);
        var c = cx * cx + cy * cy - Column.RADIUS_SQUARE;
        var D = b * b - 4 * a * c;// discriminant
        // var R1 = (-b + Math.sqrt(D))/2*a; R1 we always reject
        var R1;
        var R2 = (-b - Math.sqrt(D))/2*a;
        if (Computer.isCircleInsideBoundingArea(R2, R2, R2) && !Computer.isCircleOverlapsColumns(R2, R2, R2)) {
            circles.push(new Circle(R2, R2, R2, Circle.FIRST_CASE_CONFIG));
        }

        //**** BOTTOM-LEFT CIRCLE
        cy = HEIGHT - cy; // only cy changed (flip with center x axis)
        b = -2 * (cx + cy + Column.RADIUS);
        c = cx * cx + cy * cy - Column.RADIUS_SQUARE;
        D = b * b - 4 * a * c;// discriminant
        // R1 = (-b + Math.sqrt(D))/2*a;
        R2 = (-b - Math.sqrt(D))/2*a;
        x = R2;
        y = HEIGHT - R2;
        if (Computer.isCircleInsideBoundingArea(x, y, R2) && !Computer.isCircleOverlapsColumns(x, y, R2)) {
            circles.push(new Circle(x, y, R2, Circle.FIRST_CASE_CONFIG));
        }

        //**** TOP-RIGHT
        cy = column.Y();
        cx = WIDTH - cx;
        b = -2 * (cx + cy + Column.RADIUS);
        c = cx * cx + cy * cy - Column.RADIUS_SQUARE;
        D = b * b - 4 * a * c;// discriminant
        // R1 = (-b + Math.sqrt(D))/2*a;
        R2 = (-b - Math.sqrt(D))/2*a;
        x = WIDTH - R2;
        y = R2;
        if (Computer.isCircleInsideBoundingArea(x, y, R2) && !Computer.isCircleOverlapsColumns(x, y, R2)) {
            circles.push(new Circle(x, y, R2, Circle.FIRST_CASE_CONFIG));
        }

        //**** BOTTOM-RIGHT
        cy = HEIGHT - cy;
        b = -2 * (cx + cy + Column.RADIUS);
        c = cx * cx + cy * cy - Column.RADIUS_SQUARE;
        D = b * b - 4 * a * c;// discriminant
        // R1 = (-b + Math.sqrt(D))/2*a;
        R2 = (-b - Math.sqrt(D))/2*a;
        x = WIDTH - R2;
        y = HEIGHT - R2;
        if (Computer.isCircleInsideBoundingArea(x, y, R2) && !Computer.isCircleOverlapsColumns(x, y, R2)) {
            circles.push(new Circle(x, y, R2, Circle.FIRST_CASE_CONFIG));
        }

        return circles;
    };

//    Computer.computeSecondCase = function(column1, column2) {
//        var circles = [];
//
//        var o1 = {};
//        o1.usrCoords = [1, 15, 30];
//        var o2 = {};
//        o2.usrCoords = [1, 50, 25];
//        column2 = new Column(o2);
//        column1 = new Column(o1);
//        // TOP tangent
//        var cx1 = column1.X();
//        var cy1 = column1.Y();
//        var cx2 = column2.X();
//        var cy2 = column2.Y();
//        console.log(cx1, cy1, cx2, cy2);
//
//        // D = b^2 - 4ac
//        var factor = (Column.RADIUS + cy2) / (Column.RADIUS + cy1);
//        var a = 1 - factor;
//        var b = -2 * (cx2 - cx1 * factor);
//        var c =  cx2*cx2 + cy2*cy2 - Column.RADIUS_SQUARE - factor * (cx1*cx1 + cy1*cy1 - Column.RADIUS_SQUARE);
//        var D = b * b - 4 * a * c;// discriminant
//        console.log(factor, a, b, c, D);
//        var x1 = (-b + Math.sqrt(D))/2*a;
//        var x2 = (-b - Math.sqrt(D))/2*a;
//        var R1 = (x1*x1 - 2*cx1*x1 + cx1*cx1 + cy1*cy1 - Column.RADIUS_SQUARE) / (2*(Column.RADIUS + cy1));
//        var R2 = (x2*x2 - 2*cx1*x2 + cx1*cx1 + cy1*cy1 - Column.RADIUS_SQUARE) / (2*(Column.RADIUS + cy1));
//
//        console.log(x1, x2, R1, R2);
//
//        circles.push(new Circle(x1, R1, R1));
////        circles.push(new Circle(x1, R2, R2));
////        circles.push(new Circle(x1, R1, R2));
////        circles.push(new Circle(x1, R2, R1));
////        circles.push(new Circle(x2, R1, R1));
//        circles.push(new Circle(x2, R2, R2));
////        circles.push(new Circle(x2, R1, R2));
////        circles.push(new Circle(x2, R2, R1));
//
//        var test1 = (cx1 - x1)*(cx1 - x1) + (cy1 - R1)*(cy1 - R1) - (R1 + Column.RADIUS)*(R1 + Column.RADIUS);
//        var test2 = (cx1 - x1)*(cx1 - x1) + (cy1 - R2)*(cy1 - R2) - (R2 + Column.RADIUS)*(R2 + Column.RADIUS);
//        var test3 = (cx1 - x2)*(cx1 - x2) + (cy1 - R1)*(cy1 - R1) - (R1 + Column.RADIUS)*(R1 + Column.RADIUS);
//        var test4 = (cx1 - x2)*(cx1 - x2) + (cy1 - R2)*(cy1 - R2) - (R2 + Column.RADIUS)*(R2 + Column.RADIUS);
//
//        console.log(test1, test2, test3, test4);
////        if (Computer.isCircleInsideBoundingArea(R2, R2, R2)) {
////            circles.push(new Circle(R2, R2, R2));
////        }
//
//
//        return circles;
//    };

    Computer.computeSecondCase = function(column1, column2, transformation) {
        var circles = [];

        var tr = transformation.transform(column1.X(), column1.Y());
        var cx1 = tr[0];
        var cy1 = tr[1];
        tr = transformation.transform(column2.X(), column2.Y());
        var cx2 = tr[0];
        var cy2 = tr[1];

//        console.log(cx1, cy1, cx2, cy2);

        var x1, x2, y1, y2, D;
        if (cy1 === cy2) { // i think there is no solutions in this case
            return circles;
//            x1 = (cx2 + cx1) / 2;
//            D = (2 * x1 + Column.RADIUS - cx1) * (Column.RADIUS + cx1);
//            if (D < 0)
//                return circles;
//            D = Math.sqrt(D);
//            y1 = cy1 - D;
//            Answer answer1 = new Answer(x, transformation.inverseTransform(new Point(x, y)));
//            y2 = cy1 - D;
//            Answer answer2 = new Answer(x, transformation.inverseTransform(new Point(x, y)));
//            return getBestAnswer(validateAnswer(answer1), validateAnswer(answer2));
        }

        if (cx1 === cx2) {
            y1 = (cy2 + cy1) / 2;
            x1 = (cx1 - Column.RADIUS + (cy1 - y1) * (cy1 - y1) / (cx1 + Column.RADIUS)) / 2;
            if (Computer.isCircleInsideBoundingArea(x1, y1, x1) && !Computer.isCircleOverlapsColumns(x1, y1, x1)) {
                circles.push(new Circle(x1, y1, x1));
            }
            return circles;
        }


        var a = (cx2 - cx1) / (cy1 - cy2);
        var b = (cx1 * cx1 + cy1 * cy1 - cx2*cx2 -cy2*cy2) / (2 * (cy1 - cy2));
        D = a * (cy1 - b) + cx1 + Column.RADIUS;
        D = D*D - a*a*(cx1*cx1 - Column.RADIUS_SQUARE + (cy1 - b) * (cy1 - b));
//        console.log(a, b, D);
        if (D < 0) {
            return circles;
        }
        D = Math.sqrt(D);
        var tmp = a * (cy1 - b) + cx1 + Column.RADIUS;
//        x1 = (tmp + D) / (a*a);
//        y1 = a*x1 + b;

        x2 = (tmp - D) / (a*a);
        y2 = a*x2 + b;
//        if (Computer.isCircleInsideBoundingArea(x1, y1, x1)) {
//            circles.push(new Circle(x1, y1, x1));
//        }
        var invTr = transformation.inverse(x2, y2);
        if (Computer.isCircleInsideBoundingArea(invTr[0], invTr[1], x2) && !Computer.isCircleOverlapsColumns(invTr[0], invTr[1], x2)) {
            circles.push(new Circle(invTr[0], invTr[1], x2));
        }

        return circles;
    };

    Computer.computeThirdCase = function(columns) {
        var circles = [];

        return circles;
    };


    Computer.isCircleInsideBoundingArea = function(x, y, r) {
        var left = x - r;
        var right = x + r;
        var top = y - r;
        var bottom = y + r;

        if (left < 0) { return false; }
        if (right > WIDTH) { return false; }
        if (top < 0) { return false; }
        if (bottom > HEIGHT) { return false;}
        return true;
    };

    Computer.isCircleOverlapsColumns = function(x, y, r) {
        var columns = columnManager.columns;

        for (var i = 0; i < columns.length; i++) {
            if (Computer.isCircleOverlapsColumn(columns[i], x, y, r)) {
                return true;
            }
        }

        return false;
    };

    Computer.isCircleOverlapsColumn = function(column, x, y, r) {
        var cx = column.X();
        var cy = column.Y();

        if (((cx - x)*(cx - x) + (cy - y)*(cy - y)) + EPSILON < (Column.RADIUS + r)*(Column.RADIUS + r)) {
            return true;
        }
        return false;
    };

    function ColumnManager(board) {
        this.board = board;
        this.columns = [];
    }

    ColumnManager.prototype.addColumn = function(event) {
        var coords = getMouseCoords(event);
        var x = coords.usrCoords[1]; // center x;
        var y = coords.usrCoords[2]; // center y;
        if (Computer.isCircleInsideBoundingArea(x, y, Column.RADIUS) && this.canAddColumn(coords)) {
            this.columns.push(new Column(coords));
            boardManager.computeAndAddCircles(this.columns);
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
        this.column = null;
        this.init(coords);
    }

    Column.prototype.init = function(coords) {
        var usrX = coords.usrCoords[1];
        var usrY = coords.usrCoords[2];
        var center = b.create('point', [usrX, usrY], {fixed: true, name: '', fillColor: '#000000', strokeColor: '#000000'});
        var right = b.create('point', [usrX + Column.RADIUS, usrY], {fixed: true, visible: false});
        var column = b.create('circle', [center, right], {fillColor: '#20b2aa', fillOpacity: 0.5});
//        column.on('mousedown', function() {
//            console.log(arguments);
//        });

//        JXG.addEvent(column.rendNode, 'mousedrag', function() {
//            console.log(arguments);
//        }, column);
//
//        JXG.addEvent(column.rendNode, 'mousedown', function() {
//            console.log('mousedown', arguments);
//        }, column);
//        JXG.addEvent(column.rendNode, 'mouseup', function() {
//            console.log('mouseup', arguments);
//        }, column);
//        JXG.addEvent(column.rendNode, 'mousemove', function() {
//            console.log('mousemove', arguments);
//        }, column);


        this.column = column;
    };

    Column.prototype.isIntersected = function(coords) {
        var cx = coords.usrCoords[1];
        var cy = coords.usrCoords[2];
        var x = this.column.center.X();
        var y = this.column.center.Y();

        var distance = (cx - x) * (cx - x) + (cy - y) * (cy - y);
        if (distance > 4 * Column.RADIUS_SQUARE) { return false; }
        return true;
    };

    Column.prototype.X = function() {
        return this.column.center.X();
    };

    Column.prototype.Y = function() {
        return this.column.center.Y();
    };

    Column.RADIUS = 5;
    Column.RADIUS_SQUARE = Column.RADIUS * Column.RADIUS;

    function Circle(x, y, r, config) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.circle = null; // JXG object
        config = config || Circle.DEFAULT_CIRCLE_CONFIG;
        this.init(x, y, r, config);
    }

    Circle.DEFAULT_CENTER_POINT_CONFIG = {
        fixed: true,
        name: '',
        size: 1
    };

    Circle.DEFAULT_POINT_CONFIG = {
        fixed: true,
        name: '',
        visible: false
    };

    Circle.DEFAULT_CIRCLE_CONFIG = {
        dash: 3,
        strokeWidth: 1
    };

    Circle.FIRST_CASE_CONFIG = {
        dash: 3,
        strokeWidth: 1,
        strokeColor: '#ff7f50'
    };

    Circle.prototype.init = function(x, y, r, config) {
        var center = b.create('point', [x, y], Circle.DEFAULT_CENTER_POINT_CONFIG);
        var right = b.create('point', [x + r, y], Circle.DEFAULT_POINT_CONFIG);
        var circle = b.create('circle', [center, right], config);
        this.circle = circle;
    };

    Circle.prototype.remove = function() {
        b.removeObject(this.circle);
    };


})();
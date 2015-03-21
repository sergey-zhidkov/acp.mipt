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
        this.triangles = [];
    }

    BoardManager.prototype.computeAndAddCircles = function(columns) {
        this.removeAllCircles();
        this.removeAllTriangles();
        var circles = this.circles;
        // first case - two tangents and one column
//        columns.forEach(function(column) {
//            Array.prototype.push.apply(circles, Computer.computeFirstCase(column));
//        });
//
//        // second case - two columns and tangent
//        var i, j;
//        var column1, column2;
//        if (columns.length > 1) {
//            for (i = 0; i < columns.length; i++) {
//                column1 = columns[i];
//                for (j = i + 1; j < columns.length; j++) {
//                    column2 = columns[j];
//                    Array.prototype.push.apply(circles, Computer.computeSecondCase(column1, column2, Transformation.TR1));
//                    Array.prototype.push.apply(circles, Computer.computeSecondCase(column1, column2, Transformation.TR2));
//                    Array.prototype.push.apply(circles, Computer.computeSecondCase(column1, column2, Transformation.TR3));
//                    Array.prototype.push.apply(circles, Computer.computeSecondCase(column1, column2, Transformation.TR4));
//                }
//            }
//        }

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

    BoardManager.prototype.removeAllTriangles = function() {
        this.triangles.forEach(function(triangle) {
            triangle.remove();
        });
        this.triangles = [];
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
        this.x = usrX;
        this.y = usrY;

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
        return this.x;
    };

    Column.prototype.Y = function() {
        return this.y;
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
        this.center = center;
        this.right = right;
        this.circle = circle;
    };

    Circle.prototype.remove = function() {
        b.removeObject(this.center);
        b.removeObject(this.right);
        b.removeObject(this.circle);
    };


    Computer.computeThirdCase = function(columns) {
        var circles = [];
//        if (columns.length < 3) {
//            return circles;
//        }

//        var delaunay = new Delaunay(columns);
//        var triangles = delaunay.getTriangles();
//        triangles.forEach(function(triangle) {
//            triangle.draw();
//        });
//
//        boardManager.triangles = triangles;

        var dt = new Triangulation();


        return circles;
    };

    function Triangulation() {
        this.triGraph = new Graph();

        // initial points
        var A = new Pnt(0, 0);
        var B = new Pnt(WIDTH, 0);
        var C = new Pnt(WIDTH, HEIGHT);
        var D = new Pnt(0, HEIGHT);
        var test = new Pnt(100, 20);

        // triangle ABC
        var initialTriangle = new Triangle(A, B, C);
        this.triGraph.add(initialTriangle);
        this.mostRecent = initialTriangle;

        this.delaunayPlace(test);
    }

    Triangulation.prototype.size = function() {
        return this.triGraph.nodeSet().length;
    };

    Triangulation.prototype.contains = function(triangle) {
        return isArrayContainsNode(this.triGraph.nodeSet(), triangle);
    };

    Triangulation.prototype.neighbors = function(triangle) {
        return this.triGraph.neighbors(triangle);
    };

    function isArrayContainsNode(array, node) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].equals(node)) {
                return true;
            }
        }
        return false;
    }

    Triangulation.prototype.locate = function(point) {
        var triangle = this.mostRecent;
        if (!this.contains(triangle)) { triangle = null; }

//        var visited = []; // new HashSet<Triangle>();
//        while (triangle !== null) {
//            visited.add(triangle);
//            var corner = point.isOutside(triangle.toArray([]));
//            if (corner === null) return triangle;
//            triangle = this.neighborOpposite(corner, triangle);
//        }

        // brute force

        var triangles = this.triGraph.nodeSet();
        for (var i = 0; i < triangles.length; i++) {
            triangle = triangles[i];
            if (point.isOutside(triangle.toArray([])) === null) {
                return triangles[i];
            }
        }
        return null;
    };

    Triangulation.prototype.delaunayPlace = function(site) {
        var triangle = this.locate(site);

        var cavity = this.getCavity(site, triangle);
        this.mostRecent = this.update(site, cavity);
    };

    Triangulation.prototype.getCavity = function(site, triangle) {
        var enroached = new Set();
        var toBeChecked = [];
        var marked = new Set();

        toBeChecked.push(triangle);
        marked.add(triangle);
        while (toBeChecked.length > 0) {
            triangle = toBeChecked.pop();
            if (site.vsCircumcircle(triangle.toArray([])) === 1) {
                continue;
            }
            enroached.add(triangle);
            var neighbors = this.triGraph.neighbors(triangle);
            for (var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];
                if (marked.contains(neighbor)) {
                    continue;
                }
                marked.add(neighbor);
                toBeChecked.push(neighbor);
            }
        }
        return enroached;
    };

    Triangulation.prototype.update = function(site, cavity) {
        var boundary = new Set();
        var theTriangles = new Set();

        var cavityElements = cavity.elements();
        var i, j;
        var triangle;
        var vertex;
        var vertices;
        // Find boundary facets and adjacent triangles
        for (i = 0; i < cavityElements.length; i++) {
            triangle = cavityElements[i];
            theTriangles.addAll(this.neighbors(triangle));
            vertices = triangle.toArray();
            for (j = 0; j < vertices.length; j++) {
                vertex = vertices[j];
                var facet = triangle.facetOpposite(vertex);
                if (boundary.contains(facet)) {
                    boundary.remove(facet);
                } else {
                    boundary.add(facet);
                }
            }
        }
        theTriangles.removeAll(cavity);        // Adj triangles only

        // Remove the cavity triangles from the triangulation
        for (i = 0; i < cavityElements.length; i++) {
            triangle = cavityElements[i];
            this.triGraph.remove(triangle);
        }

        // Build each new triangle and add it to the triangulation
        var newTriangles = new Set();
        var boundaryElements = boundary.elements();
        for (i = 0; i < boundaryElements.length; i++) {
            vertices = boundaryElements[i];
            vertices.add(site);
            var tri = new Triangle(vertices);
            this.triGraph.add(tri);
            newTriangles.add(tri);
        }

        // Update the graph links for each new triangle
        theTriangles.addAll(newTriangles);    // Adj triangle + new triangles
        var newTranglesElements = newTriangles.elements();
        for (i = 0; i < newTranglesElements.length; i++) {
            triangle = newTranglesElements[i];
            var theTrianglesElements = theTriangles.elements();
            for (j = 0; j < theTrianglesElements.length; j++) {
                var other = theTrianglesElements[j];
                if (triangle.isNeighbor(other)) {
                    this.triGraph.add2Nodes(triangle, other);
                }
            }
        }

        // Return one of the new triangles
        return newTriangles.elements()[0];
    };

    //***
    function Graph() {
        this.theNeighbors = new Map();
    }

    Graph.prototype.add = function(node) {
        if (this.theNeighbors.containsKey(node)) return;
        this.theNeighbors.put(node, new Set());
    };

    Graph.prototype.add2Nodes = function(nodeA, nodeB) {
        this.theNeighbors.get(nodeA).add(nodeB);
        this.theNeighbors.get(nodeB).add(nodeA);
    };

    Graph.prototype.remove = function(node) {
        if (!this.theNeighbors.containsKey(node)) {
            return;
        }

        var keySet = this.theNeighbors.get(node);
        var elements = keySet.elements();
        for (var i = 0; i < elements.length; i++) {
            var neighbor = elements[i];
            this.theNeighbors.get(neighbor).remove(node);
        }
        this.theNeighbors.get(node).clear();
        this.theNeighbors.remove(node);
    };

    Graph.prototype.nodeSet = function() {
        return this.theNeighbors.keySet();
    };

    Graph.prototype.neighbors = function(node) {
        return this.theNeighbors.get(node);
    };

    //***
    function Triangle(p1, p2, p3) {
        this.idNumber = null;
        this.circumcenter = null;

        this.items = new Set();

        if (p1 instanceof Set) {
            this.items.addAll(p1);
        } else {
            this.items.add(p1);
            this.items.add(p2);
            this.items.add(p3);
        }

        this.idNumber = Triangle.idGenerator++;
    }

    Triangle.prototype.equals = function(o) {
        return this === o;
    };

    Triangle.prototype.toArray = function() {
        return this.items.elements();
    };

    Triangle.prototype.toString = function() {
        return "Triangle " + this.idNumber;
    };

    Triangle.prototype.isNeighbor = function(triangle) {
        var count = 0;
        var vertices = this.toArray();
        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            if (!triangle.contains(vertex)) {
                count++;
            }
        }
        return count === 1;
    };

    Triangle.prototype.contains = function(vertex) {
        return this.items.contains(vertex);
    };

    Triangle.prototype.facetOpposite = function(vertex) {
        var facet = new Set();
        facet.addArray(this.toArray());
        if (!facet.remove(vertex)) {
            throw "Vertex not in triangle";
        }
        return facet;
    };

    Triangle.idGenerator = 0;
    Triangle.moreInfo = false;

    //***
    function Pnt() {
        var first = arguments[0];
        if (Object.prototype.toString.call(first) === '[object Array]') {
            this.coordinates = Array.prototype.slice.call(first);
        } else {
            this.coordinates = Array.prototype.slice.call(arguments);
        }
    }

    Pnt.prototype.toString = function() {
        if (this.coordinates.length === 0) {
            return 'Pnt ()';
        }
        var result = 'Pnt(' + this.coordinates[0];
        for (var i = 1; i < this.coordinates.length; i++) {
            result += ',' + this.coordinates[i];
        }
        result += ')';
        return result;
    };

    Pnt.prototype.equals = function(other) {
        if (this.coordinates.length !== other.coordinates.length) { return false; }
        for (var i = 0; i < this.coordinates.length; i++) {
            if (this.coordinates[i] !== other.coordinates[i]) {
                return false;
            }
        }
        return true;
    };

    Pnt.prototype.dimension = function() {
        return this.coordinates.length;
    };

    Pnt.prototype.dimCheck = function(p) {
        var len = this.coordinates.length;
        if (len !== p.coordinates.length) {
            throw 'dimension mismatch';
        }
        return len;
    };

    Pnt.prototype.extend = function() {
        var coords = Array.prototype.slice.call(arguments);
        var result = [];
        this.coordinates.forEach(function(coord) {
            result.push(coord);
        });
        coords.forEach(function(coord) {
            result.push(coord);
        });
        return new Pnt(result);
    };

    Pnt.prototype.dot = function(p) {
        var len = this.dimCheck(p);
        var sum = 0;
        for (var i = 0; i < len; i++) {
            sum += this.coordinates[i] * p.coordinates[i];
        }
        return sum;
    };

    Pnt.prototype.vsCircumcircle = function(simplex) {
        var matrix = [];
        for (var i = 0; i < simplex.length; i++) {
            matrix.push(simplex[i].extend(1, simplex[i].dot(simplex[i])));
        }
        matrix.push(this.extend(1, this.dot(this)));
        var d = Pnt.determinant(matrix);
        var result = (d < 0) ? -1 : ((d > 0) ? +1 : 0);
        if (Pnt.content(simplex) < 0) { result =-result; }
        return result;
    };

    Pnt.content = function(simplex) {
        var matrix = new Array(simplex.length);
        var i;
        for (i = 0; i < matrix.length; i++) {
            matrix[i] = simplex[i].extend(1);
        }
        var fact = 1;
        for (i = 1; i < matrix.length; i++) {
            fact = fact*i;
        }
        return Pnt.determinant(matrix) / fact;
    };

    Pnt.prototype.relation = function(simplex) {
        /* In 2D, we compute the cross of this matrix:
         *    1   1   1   1
         *    p0  a0  b0  c0
         *    p1  a1  b1  c1
         * where (a, b, c) is the simplex and p is this Pnt. The result is a
         * vector in which the first coordinate is the signed area (all signed
         * areas are off by the same constant factor) of the simplex and the
         * remaining coordinates are the *negated* signed areas for the
         * simplices in which p is substituted for each of the vertices.
         * Analogous results occur in higher dimensions.
         */
        var dim = simplex.length - 1;
        if (this.dimension() !== dim)
            throw "Dimension mismatch";

        /* Create and load the matrix */
        var matrix = new Array(dim + 1);
        /* First row */
        var coords = new Array(dim + 2);
        var i, j;
        for (j = 0; j < coords.length; j++) {
            coords[j] = 1;
        }
        matrix[0] = new Pnt(coords);
        /* Other rows */
        for (i = 0; i < dim; i++) {
            coords[0] = this.coordinates[i];
            for (j = 0; j < simplex.length; j++) {
                coords[j+1] = simplex[j].coordinates[i];
            }
            matrix[i+1] = new Pnt(coords);
        }

        /* Compute and analyze the vector of areas/volumes/contents */
        var vector = Pnt.cross(matrix);
        var content = vector.coordinates[0];
        var result = new Array(dim + 1);
        for (i = 0; i < result.length; i++) {
            var value = vector.coordinates[i+1];
            if (Math.abs(value) <= 1.0e-6 * Math.abs(content)) result[i] = 0;
            else if (value < 0) result[i] = -1;
            else result[i] = 1;
        }
        if (content < 0) {
            for (i = 0; i < result.length; i++) {
                result[i] = -result[i];
            }
        }
        if (content === 0) {
            for (i = 0; i < result.length; i++) {
                result[i] = Math.abs(result[i]);
            }
        }
        return result;
    };

    Pnt.prototype.isOutside = function(simplex) {
        var result = this.relation(simplex);
        for (var i = 0; i < result.length; i++) {
            if (result[i] > 0) {
                return simplex[i];
            }
        }
        return null;
    };

    Pnt.determinant = function(matrix) {
        if (matrix.length !== matrix[0].dimension()) {
            throw "Matrix is not square";
        }
        var columns = [];
        for (var i = 0; i < matrix.length; i++) {
            columns.push(true);
        }

        try {
            return Pnt.determinantCol(matrix, 0, columns);
        } catch (e) {
            throw "Matrix is wrong shape";
        }
    };

    Pnt.determinantCol = function(matrix, row, columns) {
        if (row === matrix.length) return 1;
        var sum = 0;
        var sign = 1;
        for (var col = 0; col < columns.length; col++) {
            if (!columns[col]) continue;
            columns[col] = false;
            sum += sign * matrix[row].coordinates[col] * Pnt.determinantCol(matrix, row+1, columns);
            columns[col] = true;
            sign = -sign;
        }
        return sum;
    };

    Pnt.cross = function(matrix) {
        var len = matrix.length + 1;
        if (len !== matrix[0].dimension()) {
            throw "Dimension mismatch";
        }
        var i;
        var columns = [];
        for (i = 0; i < len; i++) {
            columns.push(true);
        }
        var result = new Array(len);
        var sign = 1;
        try {
            for (i = 0; i < len; i++) {
                columns[i] = false;
                result[i] = sign * Pnt.determinantCol(matrix, 0, columns);
                columns[i] = true;
                sign = -sign;
            }
        } catch (e) {
            throw "Matrix is wrong shape";
        }
        return new Pnt(result);
    };

    //*** Map
    function Map() {
        this.map = {};
    }

    Map.prototype.put = function(key, value) {
        var string = key.toString();
        this.map[string] = [key, value];
    };

    Map.prototype.get = function(key) {
        var string = key.toString();
        var array = this.map[string];
        if (typeof array === 'undefined') {
            return null;
        }
        return array[1];
    };

    Map.prototype.containsKey = function(key) {
        var strings = Object.keys(this.map);
        for (var i = 0; i < strings.length; i++) {
            var string = strings[i];
            var currKey = this.map[string][0];
            if (currKey.equals(key)) {
                return true;
            }
        }
        return false;
    };

    Map.prototype.keySet = function() {
        var keySet = [];
        var strings = Object.keys(this.map);
        for (var i = 0; i < strings.length; i++) {
            var string = strings[i];
            var currKey = this.map[string][0];
            keySet.push(currKey);
        }
        return keySet;
    };

    Map.prototype.size = function() {
        return Object.keys(this.map).length;
    };

    Map.prototype.remove = function(key) {
        var value = this.get(key);
        delete this.map[key.toString()];
        return value;
    };

    Map.prototype.clear = function() {
        this.map = {};
    };

    //***
    function Set() {
        this.map = new Map();
    }

    Set.prototype.add = function(key) {
//        if (this.map.containsKey(key)) {
//            return;
//        }
        this.map.put(key, key);
    };

    Set.prototype.addAll = function(elementSet) {
        var elements = elementSet.elements();
        for (var i = 0; i < elements.length; i++) {
            this.add(elements[i]);
        }
    };

    Set.prototype.addArray = function(elements) {
        for (var i = 0; i < elements.length; i++) {
            this.add(elements[i]);
        }
    };

    Set.prototype.remove = function(key) {
        return this.map.remove(key);
    };

    Set.prototype.removeAll = function(keySet) {
        var elements = keySet.elements();
        for (var i = 0; i < elements.length; i++) {
            this.remove(elements[i]);
        }
    };

    Set.prototype.elements = function() {
        return this.map.keySet();
    };

    Set.prototype.contains = function(key) {
        return this.map.containsKey(key);
    };

    Set.prototype.containsAll = function(keySet) {
        var keys = this.map.keySet();
        for (var i = 0; i < keys.length; i++) {
            if (!keySet.contains(keys[i])) {
                return false;
            }
        }
        return true;
    };

    Set.prototype.equals = function(o) {
        if (this === o) { return true; }
        if (this.size() !== o.size()) { return false; }
        if (this.containsAll(o)) { return true; }
        return false;
    };

    Set.prototype.size = function() {
        return this.map.size();
    };

    Set.prototype.clear = function() {
        this.map.clear();
    };














    //**** Delaunay triangulation
    function Delaunay(columns) {
        this.init(columns);
    }

    Delaunay.prototype.init = function(columns) {
        this.columns = columns;
        this.triangles = [];
        this.createCache();
        this.createFirstTwoTriangles();
    };

    Delaunay.prototype.getTriangles = function() {
        this.createTriangulation();
        return this.triangles;
    };

    Delaunay.prototype.createTriangulation = function() {
        var columns = this.columns;

        var nextColumn;
        for (var i = 0; i < columns.length; i++) {
            nextColumn = columns[i];
            this.addPoint(nextColumn);
        }
    };

    Delaunay.prototype.addPoint = function(column) {
        var point = new Point(column.X(), column.Y());
        var triangleAndIndex = this.getTriangleAndIndexByPoint(point);
        var triangle = triangleAndIndex[0];
        this.recreateTriangles(triangle);
    };

    Delaunay.prototype.recreateTriangles = function(triangle) {

    };

    Delaunay.prototype.getTriangleAndIndexByPoint = function(point) {
        var triangle;
        for (var i = 0; i < this.triangles.length; i++) {
            triangle = this.triangles[i];
            if (triangle.pointInsideTriangle(point)) {
                return [triangle, i];
            }
        }
        return [null, -1];
    };

    Delaunay.prototype.createCache = function() {

    };

    Delaunay.prototype.createFirstTwoTriangles = function() {
        // create first two triangles
        // points
        var A = new Point(0, 0);
        var B = new Point(WIDTH, 0);
        var C = new Point(WIDTH, HEIGHT);
        var D = new Point(0, HEIGHT);

        var tr1 = new Triangle(A, C, B);
        var tr2 = new Triangle(A, D, C);
        tr1.setNeighbours(null, null, tr2);
        tr2.setNeighbours(null, tr1, null);
        this.triangles.push(tr1);
        this.triangles.push(tr2);
    };


    function Point(x, y) {
        this.x = x;
        this.y = y;
        this.coords = [x, y];
    }

    function Edge(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

//    // always in cw order
//    function Triangle(p1, p2, p3) {
//        this.p1 = p1;
//        this.p2 = p2;
//        this.p3 = p3;
//        this.points = [p1, p2, p3];
//        this.neighbours = [];
//        this.jsxObjects = [];
//    }
//
//    Triangle.prototype.pointInsideTriangle = function(p) {
//        var a = (this.p1.x - p.x)*(this.p2.y - this.p1.y) - (this.p2.x - this.p1.x)*(this.p1.y - p.y);
//        var b = (this.p2.x - p.x)*(this.p3.y - this.p2.y) - (this.p3.x - this.p2.x)*(this.p2.y - p.y);
//        var c = (this.p3.x - p.x)*(this.p1.y - this.p3.y) - (this.p1.x - this.p3.x)*(this.p3.y - p.y);
//
//        if ((a <= 0 && b <= 0 && c <= 0) || (a >= 0 && b >= 0 && c >= 0)) {
//            return true;
//        }
//
//        return false;
//    };
//
//    Triangle.prototype.setNeighbours = function(tr1, tr2, tr3) {
//        this.neighbours = [tr1, tr2, tr3];
//    };
//
//    Triangle.prototype.draw = function() {
//        var p1 = b.create('point', this.p1.coords, {fixed: true, name: '', visible: false});
//        var p2 = b.create('point', this.p2.coords, {fixed: true, name: '', visible: false});
//        var p3 = b.create('point', this.p3.coords, {fixed: true, name: '', visible: false});
//
//        var l1 = b.create('line', [p1, p2], {straightFirst:false, straightLast:false, strokeWidth: 0.5, strokeColor: '#a52a2a'});
//        var l2 = b.create('line', [p1, p3], {straightFirst:false, straightLast:false, strokeWidth: 0.5, strokeColor: '#a52a2a'});
//        var l3 = b.create('line', [p3, p2], {straightFirst:false, straightLast:false, strokeWidth: 0.5, strokeColor: '#a52a2a'});
//
//        this.jsxObjects = [p1, p2, p3, l1, l2, l3];
//    };
//
//    Triangle.prototype.remove = function() {
//        this.jsxObjects.forEach(function(obj) {
//            b.removeObject(obj);
//        });
//    };

})();
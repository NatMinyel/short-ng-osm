export class PriorityNode {
  key:number;
  priority:number;

  constructor(key: number,priority: number){
    this.key = key;
    this.priority = priority;
  }
}

/**
 * A priority queue with highest priority always on top
 * This queue is sorted by priority for each enqueue
 */
export class PriorityQueue {

  nodes:PriorityNode[] = [];

  enqueue(priority:number, key:number){
    this.nodes.push(new PriorityNode(key, priority));
    this.nodes.sort(
      function(a, b) {
        return a.priority - b.priority;
      }
    );
  }

  dequeue():number{
    return this.nodes.shift().key;
  }


  empty():boolean{
    return !this.nodes.length;
  }
}


export class Graph {
  private vertices: any;
  private edges: any;
  private infinity = 1 / 0;

  static distance(lat1, lon1, lat2, lon2) {
    let p = 0.017453292519943295;
    let cos = Math.cos;
    let a = 0.5 - cos((lat2 - lat1) * p) / 2 + cos(lat1 * p) * cos(lat2 * p) * (1 - cos((lon2 - lon1) * p)) / 2;
    return 12742 * Math.asin(Math.sqrt(a));
  }

  static hashify(data) {
    let dict = {};
    let i = 0;
    for (; i < data.osm.node.length; i++) {
      dict[data.osm.node[i].$.id] = {'info': data.osm.node[i], 'neighbors': []};
    }
    // dict['length'] = i + 1;
    return dict;
  }


  getFromXML(data) {
    this.vertices = Graph.hashify(data);
    let edges_ = [];
    let k = 0;
    // Add edges to graph.
    for (let i = 0; i < data.osm.way.length; i++) {
      let prev = this.vertices[data.osm.way[i].nd[0].$.ref];
      for (let j = 1; j < data.osm.way[i].nd.length; j++) {
        let curr = this.vertices[data.osm.way[i].nd[j].$.ref];
        let dist = Graph.distance(prev.info.$.lat, prev.info.$.lon, curr.info.$.lat, curr.info.$.lon);
        edges_.push({
          "weight": dist,
          "src": prev.info.$.id, "dst": curr.info.$.id, "id": k
        });
        prev['neighbors'].push({'node': curr.info.$.id, "weight": dist});
        prev = curr;
        k++;
      }
    }

    this.edges = edges_;
  }

  getVertices() {
    return this.vertices;
  }

  getEdges() {
    return this.edges;
  }

  shortestPath(start, finish) {
    let nodes = new PriorityQueue(),
      distances = {},
      previous = {},
      path = [],
      smallest,
      neighbor,
      alt;

    //Init the distances and queues variables
    let i = 0;
    for (let vertex in this.vertices) {
      if (vertex == start) {
        // console.log("V", vertex, start);
        distances[vertex] = 0;
        nodes.enqueue(0, start);
      } else {
        distances[vertex] = this.infinity;
        nodes.enqueue(this.infinity, Number.parseInt(vertex));
      }

      previous[vertex] = null;
      i++;

    }
    //continue as long as the queue isn't empty.
    // console.log(nodes, {});
    while (!nodes.empty()) {
      smallest = nodes.dequeue();

      //we are at the last node
      if (smallest == finish) {

        //Compute the path
        while (previous[smallest]) {
          path.push(smallest.toString());
          smallest = previous[smallest];
        }
        break;
      }

      //No distance known. Skip.
      if (!smallest || distances[smallest] == this.infinity) {
        continue;
      }

      for (neighbor in this.vertices[smallest].neighbors) {
        alt = distances[smallest] + this.vertices[smallest].neighbors[neighbor].weight;
        //Compute the distance for each neighbor

        if (alt < distances[this.vertices[smallest].neighbors[neighbor].node]) {
          // console.log(nodes.nodes.length);
          distances[this.vertices[smallest].neighbors[neighbor].node] = alt;
          previous[this.vertices[smallest].neighbors[neighbor].node] = smallest;
          nodes.enqueue(alt, this.vertices[smallest].neighbors[neighbor].node);
        }
      }
    }
    //the starting point isn't in the solution &
    //the solution is from end to start.
    return path.concat(start).reverse();
  }
}

/* eslint-disable */
import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
  Vector2
} from "three";

// Hans Martin: Got this from: https://stackoverflow.com/questions/71620101/how-to-create-oblique-cylinders-cones-in-three-js
export default class CustomCylinderGeometry extends BufferGeometry {
  constructor(
    heightSegmentFunction, // x, y, z, radius
    radialSegments = 8,
    heightSegments = 1,
    openEnded = false,
    thetaStart = 0,
    thetaLength = Math.PI * 2
  ) {
    super();
    this.type = "AdvancedCylinderGeometry";

    const scope = this;

    radialSegments = Math.floor(radialSegments);
    heightSegments = Math.floor(heightSegments);
    const [, , , radiusBottom] = heightSegmentFunction(0, heightSegments);
    const [, height, , radiusTop] = heightSegmentFunction(
      heightSegments,
      heightSegments
    );

    // buffers

    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    // helper variables

    let index = 0;
    const indexArray = [];
    let groupStart = 0;

    // generate geometry

    generateTorso();

    if (openEnded === false) {
      if (radiusTop > 0) generateCap(true);
      if (radiusBottom > 0) generateCap(false);
    }

    // build geometry

    this.setIndex(indices);
    this.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    this.setAttribute("normal", new Float32BufferAttribute(normals, 3));
    this.setAttribute("uv", new Float32BufferAttribute(uvs, 2));

    function generateTorso() {
      const normal = new Vector3();
      const vertex = new Vector3();

      let groupCount = 0;

      // this will be used to calculate the normal
      const slope = (radiusBottom - radiusTop) / height;

      // generate vertices, normals and uvs

      for (let y = 0; y <= heightSegments; y++) {
        const [cx, cy, cz, radius] = heightSegmentFunction(y, heightSegments);
        const indexRow = [];

        const v = y / heightSegments;

        // calculate the radius of the current row

        //const radius = v * (radiusBottom - radiusTop) + radiusTop;

        for (let x = 0; x <= radialSegments; x++) {
          const u = x / radialSegments;
          const theta = u * thetaLength + thetaStart;
          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);
          vertex.x = cx + radius * sinTheta;
          vertex.y = cy;
          vertex.z = cz + radius * cosTheta;
          vertices.push(vertex.x, vertex.y, vertex.z);
          normal.set(sinTheta, slope, cosTheta).normalize();
          normals.push(normal.x, normal.y, normal.z); // TODO: probably not correct
          uvs.push(u, 1 - v);
          indexRow.push(index++);
        }
        indexArray.push(indexRow);
      }

      // generate indices

      for (let x = 0; x < radialSegments; x++) {
        for (let y = 0; y < heightSegments; y++) {
          // we use the index array to access the correct indices

          const a = indexArray[y][x];
          const b = indexArray[y + 1][x];
          const c = indexArray[y + 1][x + 1];
          const d = indexArray[y][x + 1];

          // faces

          indices.push(a, b, d);
          indices.push(b, c, d);

          // update group counter

          groupCount += 6;
        }
      }

      // add a group to the geometry. this will ensure multi material support

      scope.addGroup(groupStart, groupCount, 0);

      // calculate new start value for groups

      groupStart += groupCount;
    }

    function generateCap(top) {
      // save the index of the first center vertex
      const centerIndexStart = index;

      const uv = new Vector2();
      const vertex = new Vector3();

      let groupCount = 0;

      const sign = top === true ? 1 : -1;
      const [cx, cy, cz, radius] = heightSegmentFunction(
        top ? 0 : heightSegments,
        heightSegments
      );

      // first we generate the center vertex data of the cap.
      // because the geometry needs one set of uvs per face,
      // we must generate a center vertex per face/segment

      for (let x = 1; x <= radialSegments; x++) {
        vertices.push(cx, cy, cz);
        normals.push(0, sign, 0);
        uvs.push(0.5, 0.5);
        index++;
      }

      // save the index of the last center vertex
      const centerIndexEnd = index;

      // now we generate the surrounding vertices, normals and uvs

      for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;
        const theta = u * thetaLength + thetaStart;

        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        vertex.x = cx + radius * sinTheta;
        vertex.y = cy;
        vertex.z = cz + radius * cosTheta;
        vertices.push(vertex.x, vertex.y, vertex.z);
        normals.push(0, sign, 0);
        uv.x = cosTheta * 0.5 + 0.5;
        uv.y = sinTheta * 0.5 * sign + 0.5;
        uvs.push(uv.x, uv.y);
        index++;
      }

      // generate indices

      for (let x = 0; x < radialSegments; x++) {
        const c = centerIndexStart + x;
        const i = centerIndexEnd + x;

        if (top === true) {
          indices.push(i, i + 1, c);
        } else {
          indices.push(i + 1, i, c);
        }

        groupCount += 3;
      }
      scope.addGroup(groupStart, groupCount, top === true ? 1 : 2);
      groupStart += groupCount;
    }
  }
}

import Image from './image/main'
import Link from './link/main'
import ImageInfo from './image'
import LinkInfo from './link'
import Shape from './shape/main'
import ShapeInfo from './shape'

export default {
  Link: {
    component: Link,
    info: LinkInfo
  },
  Image: {
    component: Image,
    info: ImageInfo
  },
  Shape: {
    component: Shape,
    info: ShapeInfo
  },
}

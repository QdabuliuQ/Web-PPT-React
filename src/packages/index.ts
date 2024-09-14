import Image from './image/main'
import Link from './link/main'
import ImageInfo from './image'
import LinkInfo from './link'

export default {
  Link: {
    component: Link,
    info: LinkInfo
  },
  Image: {
    component: Image,
    info: ImageInfo
  }
}

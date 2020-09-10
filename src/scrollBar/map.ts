export type Info<T = string> = {
    offset: T,
    scroll: T,
    scrollSize: T,
    size: T,
    axis: T,
    client: T,
    direction: T,
    content: T
}

type Map = {
    vertical: Info
    horizontal: Info
}

export const map: Map = {
    vertical: {
        offset: 'offsetHeight',
        scroll: 'scrollTop',
        scrollSize: 'scrollHeight',
        size: 'height',
        axis: 'Y',
        client: 'clientY',
        direction: 'top',
        content: 'clientHeight'
    },
    horizontal: {
      offset: 'offsetWidth',
      scroll: 'scrollLeft',
      scrollSize: 'scrollWidth',
      size: 'width',
      axis: 'X',
      client: 'clientX',
      direction: 'left',
      content: 'clientWidth'
    }
}
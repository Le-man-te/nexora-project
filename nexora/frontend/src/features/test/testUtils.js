import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'

const mountedRoots = new Set()

export function renderWithProviders(ui, { container, providers = [] } = {}) {
  const host = container ?? document.createElement('div')
  if (!container) document.body.append(host)

  const tree = providers.reduceRight((child, provider) => {
    const Provider = typeof provider === 'function' ? provider : provider.component
    const props = typeof provider === 'function' ? {} : provider.props
    return createElement(Provider, props, child)
  }, ui)
  const root = createRoot(host)
  mountedRoots.add({ root, host, ownsContainer: !container })

  act(() => root.render(tree))

  return {
    container: host,
    unmount() {
      act(() => root.unmount())
      if (!container) host.remove()
      for (const mountedRoot of mountedRoots) {
        if (mountedRoot.root === root) mountedRoots.delete(mountedRoot)
      }
    },
  }
}

export function cleanup() {
  for (const mountedRoot of mountedRoots) {
    act(() => mountedRoot.root.unmount())
    if (mountedRoot.ownsContainer) mountedRoot.host.remove()
  }
  mountedRoots.clear()
}

export function registerTestCleanup(registerAfterEach) {
  if (typeof registerAfterEach !== 'function') {
    throw new TypeError('registerTestCleanup requires the test runner’s afterEach function.')
  }
  registerAfterEach(cleanup)
}
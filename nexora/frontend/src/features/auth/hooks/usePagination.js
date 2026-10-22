import { useMemo, useState } from 'react'

function usePagination(items = [], pageSize = 10) {
  if (!Array.isArray(items)) {
    throw new TypeError('usePagination items must be an array.')
  }
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError('usePagination pageSize must be a positive integer.')
  }

  const [requestedPage, setRequestedPage] = useState(1)
  const totalPages = Math.ceil(items.length / pageSize)
  const currentPage = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, items.length)
  const paginatedItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [endIndex, items, startIndex],
  )

  function goToPage(page) {
    if (!Number.isInteger(page)) {
      throw new TypeError('usePagination page must be an integer.')
    }
    setRequestedPage(Math.max(1, Math.min(page, Math.max(totalPages, 1))))
  }

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    previousPage: () => goToPage(currentPage - 1),
    canGoNext: currentPage < totalPages,
    canGoPrevious: currentPage > 1 && totalPages > 0,
  }
}

export default usePagination
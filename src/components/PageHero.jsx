import { PAGES } from '../data/pages'
import Icon from './Icon'

// The coloured band at the top of each page: which page this is, one line about it, and the
// page's main controls (league tabs, day picker) passed in as children.
function PageHero({ pageId, children }) {
  const page = PAGES.find((entry) => entry.id === pageId)

  return (
    <div className="page-hero">
      <div className="page-hero__inner">
        <p className="page-hero__eyebrow">
          <Icon name={page.icon} size={16} />
          {page.label}
        </p>
        <p className="page-hero__lead">{page.lead}</p>
        {children}
      </div>
    </div>
  )
}

export default PageHero

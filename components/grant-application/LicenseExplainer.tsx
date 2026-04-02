import CustomLink from '@/components/Link'

export default function LicenseExplainer() {
  return (
    <small>
      We only support projects that are free as in freedom and open to all.
      Everything produced under an OpenSats grant must be available to the
      public at all times. Your project must have a proper open-source license &
      educational materials must be available to the public under a{' '}
      <CustomLink href="https://www.gnu.org/licenses/license-list.html">
        free and open license
      </CustomLink>
      .
    </small>
  )
}

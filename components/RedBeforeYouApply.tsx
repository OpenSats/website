import CustomLink from '@/components/Link'

export default function RedBeforeYouApply() {
  return (
    <div className="mb-8 max-w-2xl">
      <h3>Before you apply</h3>

      <p>
        <strong>Do not submit vulnerability details through this form.</strong>{' '}
        Tell us who you are, what you have worked on, and the general scope of
        what you propose to do. Do not include exploit code, reproduction steps,
        affected addresses or keys, or any other nonpublic technical findings.
        This form is not a secure disclosure channel. If you have an unreported
        vulnerability, report it through the affected project&apos;s own
        security contact or disclosure process.
      </p>

      <p>
        <strong>Funding is not authorization.</strong> Applying for or receiving
        funding from OpenSats does not give you permission to access, test,
        disrupt, or interfere with any system, device, network, account, funds,
        or data. OpenSats does not own or operate the third-party projects and
        systems that may be the subject of your research and cannot authorize
        testing of them. You are solely responsible for obtaining any permission
        your work requires and for complying with all applicable laws,
        regulations, licenses, contracts, and third-party rights, including
        computer-access, anti-circumvention, privacy, sanctions, and
        export-control requirements.
      </p>

      <p>
        <strong>How funding may be used.</strong> Funding may be used only for
        good-faith security research conducted on code, hardware, accounts, and
        infrastructure you are legally entitled to study. Funding may not be
        used to test third-party systems, production services, live user
        accounts, live funds, or public networks unless the owner or operator
        has authorized that testing in writing.
      </p>

      <p>
        <strong>Handle findings responsibly.</strong> Report material
        vulnerabilities privately to the appropriate maintainer, vendor, or
        operator, and allow a reasonable opportunity to investigate and
        remediate before public disclosure. Do not exploit a vulnerability for
        unauthorized access or gain, condition disclosure on payment, or sell,
        transfer, or provide nonpublic findings to anyone who may misuse them.
        Failure to meet these conditions may result in rejection of your
        application or suspension or termination of funding, and repayment where
        the applicable grant terms provide for it.
      </p>

      <p>
        <strong>Urgent circumstances.</strong> Nothing above requires you to
        stay silent where prompt action is reasonably necessary to prevent
        ongoing theft or imminent harm. If that situation arises, minimize
        access and disruption, preserve evidence, contact the affected
        maintainer or operator promptly, and get your own legal advice about
        whether anyone else should be notified. Do not move, access, or take
        custody of anyone else&apos;s funds or data because you believe doing so
        will protect them, unless you have authorization or have been advised by
        qualified counsel.
      </p>

      <p>
        <strong>Check your existing obligations.</strong> Before you apply,
        confirm that the work you propose is not restricted by an employment or
        consulting agreement, a confidentiality or intellectual property
        obligation, bug bounty terms, or any other commitment you have made.
        OpenSats does not assess whether your work is permitted under those
        arrangements.
      </p>

      <p>
        <strong>You remain independent.</strong> A grant does not make you an
        employee, agent, partner, or representative of OpenSats, and you may not
        state or imply that OpenSats authorized your access or endorses any
        finding or conclusion. OpenSats may set conditions on a grant, ask for
        information about the work, and suspend or end funding, but you remain
        responsible for how the research is conducted and for your findings,
        statements, and publications.
      </p>

      <p>
        <strong>Get your own advice.</strong> OpenSats does not provide legal,
        tax, or other professional advice and, except as expressly stated in a
        written grant agreement, does not indemnify or defend applicants or
        grantees or pay their legal costs. Security research can create civil,
        criminal, and contractual exposure. If your work may approach a legal or
        contractual line, consult qualified counsel before you start.
      </p>

      <p>
        <strong>Applying does not guarantee funding or confidentiality.</strong>{' '}
        OpenSats may accept or decline any application at its discretion and may
        change or end this program at any time. Submitting an application does
        not create a confidential, fiduciary, employment, agency, partnership,
        or attorney-client relationship. OpenSats may share your application
        with directors, personnel, advisers, and reviewers involved in
        evaluating or administering it. Do not submit information you are not
        authorized to disclose.
      </p>

      <p>
        <strong>Payment and tax.</strong> OpenSats may require identity, tax,
        sanctions screening, or other compliance information before making any
        payment, and may report or withhold amounts where required by law. The
        tax treatment of anything you receive depends on your circumstances and
        jurisdiction. Determining and reporting it is your responsibility, and
        you should get your own tax advice.
      </p>

      <p>
        <em>
          Effective August 5, 2026. These requirements are in addition to the
          OpenSats <CustomLink href="/terms">Terms of Use</CustomLink> and{' '}
          <CustomLink href="/privacy">Privacy Policy</CustomLink> and to any
          grant terms provided to an approved applicant. If they conflict, the
          applicable grant terms control as to that grant.
        </em>
      </p>
    </div>
  )
}

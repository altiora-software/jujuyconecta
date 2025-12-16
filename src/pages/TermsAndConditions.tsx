import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";

const sections = [
  { id: "acceptance", title: "1. Acceptance" },
  { id: "access-registration", title: "2. Access and Registration" },
  { id: "permitted-use", title: "3. Permitted Use" },
  { id: "provided-information", title: "4. Provided Information" },
  { id: "privacy-data", title: "5. Privacy and Personal Data" },
  { id: "thirdparty-content", title: "6. Third-Party Content" },
  { id: "liability-limitation", title: "7. Limitation of Liability" },
  { id: "modifications", title: "8. Modifications" },
  { id: "jurisdiction", title: "9. Jurisdiction" },
  { id: "note", title: "Important Note" },
];

export default function TermsAndConditions() {
  const lastUpdated = "09/24/2025"; // TODO: update when appropriate

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            📜 Terms and Conditions – Jujuy Conecta
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: <time dateTime="2025-09-24">{lastUpdated}</time>
          </p>
        </header>

        {/* Index */}
        <nav aria-label="Index" className="mb-8 border rounded-lg p-4">
          <p className="font-medium mb-2">Contents</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a className="hover:underline" href={`#${s.id}`}>
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <section id="acceptance">
            <h2>1. Acceptance</h2>
            <p>
              By registering and using Jujuy Conecta, the user accepts these
              Terms and Conditions. If you do not agree, you must refrain from
              using the application.
            </p>
          </section>

          <section id="access-registration">
            <h2>2. Access and Registration</h2>
            <p>
              To access certain features, the user must log in with their Google
              account. Authentication is only performed to verify identity and
              allow the use of the digital assistant. Jujuy Conecta does not
              access emails, contacts, or personal files from the Google
              account.
            </p>
          </section>

          <section id="permitted-use">
            <h2>3. Permitted Use</h2>
            <ul>
              <li>
                Use the application only for informational, educational, or
                consultation purposes.
              </li>
              <li>
                Do not use the platform for illegal, defamatory activities, or
                those that infringe upon the rights of third parties.
              </li>
              <li>
                Respect community rules and use the information responsibly.
              </li>
            </ul>
          </section>

          <section id="provided-information">
            <h2>4. Provided Information</h2>
            <ul>
              <li>
                Information comes from public sources and may not always be up
                to date.
              </li>
              <li>
                Jujuy Conecta does not guarantee absolute accuracy or permanent
                availability of services.
              </li>
              <li>
                The application does not replace official, medical, legal, or
                professional consultations.
              </li>
            </ul>
          </section>

          <section id="privacy-data">
            <h2>5. Privacy and Personal Data</h2>
            <ul>
              <li>
                The only required data is the email address linked to the Google
                account.
              </li>
              <li>
                This data is used exclusively to create the user profile and log
                their activity within the app.
              </li>
              <li>
                Personal data will not be shared with third parties without
                prior consent, except when legally required.
              </li>
              <li>
                The user may request deletion of their account and data by
                writing to{" "}
                <a href="mailto:jujuyconecta@gmail.com">
                  jujuyconecta@gmail.com
                </a>
                .
              </li>
            </ul>
          </section>

          <section id="thirdparty-content">
            <h2>6. Third-Party Content</h2>
            <p>
              Jujuy Conecta may display information about businesses,
              institutions, transportation, and services. This content is
              informational and public in nature and does not imply any formal
              association or endorsement.
            </p>
          </section>

          <section id="liability-limitation">
            <h2>7. Limitation of Liability</h2>
            <p>
              Use of the application is under the sole responsibility of the
              user. Jujuy Conecta is not responsible for damages, losses, or
              inconveniences resulting from the use of published information.
            </p>
          </section>

          <section id="modifications">
            <h2>8. Modifications</h2>
            <p>
              Jujuy Conecta may update these Terms and Conditions at any time.
              Changes will be notified in the application or on the official
              website.
            </p>
          </section>

          <section id="jurisdiction">
            <h2>9. Jurisdiction</h2>
            <p>
              These Terms are governed by the laws of the Argentine Republic.
              Any dispute will be resolved in the courts of the Province of
              Jujuy.
            </p>
          </section>

          <section id="note">
            <h2>📌 Important Note</h2>
            <p>
              The application is in free version and may present bugs or
              limitations.
            </p>
          </section>
        </article>

        <footer className="mt-10 text-sm text-muted-foreground">
          <p>
            Looking for our{" "}
            <Link className="underline" to="/privacidad">
              Privacy Policy
            </Link>
            ?
          </p>
        </footer>
      </div>
    </Layout>
  );
}

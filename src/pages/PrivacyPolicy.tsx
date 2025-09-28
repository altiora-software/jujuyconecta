import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";

const sections = [
  { id: "introduction", title: "1. Introduction" },
  { id: "data", title: "2. Data Collected" },
  { id: "usage", title: "3. Use of Data" },
  { id: "sharing", title: "4. Data Sharing" },
  { id: "security", title: "5. Storage and Security" },
  { id: "retention", title: "6. Data Retention" },
  { id: "rights", title: "7. User Rights" },
  { id: "thirdparties", title: "8. Third-Party Services" },
  { id: "minors", title: "9. Minors" },
  { id: "changes", title: "10. Policy Changes" },
  { id: "contact", title: "11. Contact" },
];

export default function PrivacyPolicy() {
  const lastUpdated = "09/24/2025"; // update when appropriate

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            🔒 Privacy Policy – Jujuy Conecta
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
          <section id="introduction">
            <h2>1. Introduction</h2>
            <p>
              At Jujuy Conecta we respect your privacy. This Policy explains
              what data we collect, how we use it, and what your rights are when
              using the application.
            </p>
          </section>

          <section id="data">
            <h2>2. Data Collected</h2>
            <p>For the app to function we only request:</p>
            <ul>
              <li>
                <strong>Email address linked to your Google account:</strong>{" "}
                used to authenticate your identity and create your profile in
                the application.
              </li>
              <li>
                <strong>Minimal technical information:</strong> basic usage data
                (access date, queries performed anonymously, statistics) for the
                purpose of improving the service.
              </li>
            </ul>
            <p className="mt-3">
              <strong>👉 We do not access</strong> your emails, contacts, files,
              or any private information from your Google account.
            </p>
          </section>

          <section id="usage">
            <h2>3. Use of Data</h2>
            <p>The collected data is used to:</p>
            <ul>
              <li>Allow secure login.</li>
              <li>Personalize your experience in the app.</li>
              <li>Improve the service based on general usage metrics.</li>
              <li>Contact you only if necessary for support or issues.</li>
            </ul>
          </section>

          <section id="sharing">
            <h2>4. Data Sharing</h2>
            <ul>
              <li>
                We do not sell, rent, or share your personal data with third
                parties.
              </li>
              <li>
                Data may only be shared if legally required (e.g., court order).
              </li>
            </ul>
          </section>

          <section id="security">
            <h2>5. Storage and Security</h2>
            <ul>
              <li>
                Data is stored on secure servers from trusted providers.
              </li>
              <li>
                We implement technical and organizational measures to protect
                information against unauthorized access.
              </li>
              <li>
                In the event of a security incident, we will notify the user and
                relevant authorities as required by law.
              </li>
            </ul>
          </section>

          <section id="retention">
            <h2>6. Data Retention</h2>
            <ul>
              <li>
                We keep your data as long as you have an active account in Jujuy
                Conecta.
              </li>
              <li>
                If you request deletion, your information will be permanently
                erased within a maximum of 30 days.
              </li>
            </ul>
          </section>

          <section id="rights">
            <h2>7. User Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data.</li>
              <li>Correct it if it is inaccurate.</li>
              <li>Request deletion of your account and data.</li>
              <li>Restrict or object to the processing of your data.</li>
            </ul>
            <p>
              To exercise these rights, you can write to{" "}
              <a href="mailto:jujuyconecta@gmail.com">jujuyconecta@gmail.com</a>.
            </p>
          </section>

          <section id="thirdparties">
            <h2>8. Third-Party Services</h2>
            <p>
              Login is carried out through Google Identity Services (OAuth
              2.0). Google’s Privacy Policy can be reviewed at{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://policies.google.com/privacy
              </a>
              .
            </p>
          </section>

          <section id="minors">
            <h2>9. Minors</h2>
            <p>
              The service is intended for users over 13 years old. If a minor
              accesses without authorization, the guardian or responsible adult
              may request the immediate deletion of associated data.
            </p>
          </section>

          <section id="changes">
            <h2>10. Policy Changes</h2>
            <p>
              We may update this Privacy Policy. We will notify of relevant
              changes in the application or on the website.
            </p>
          </section>

          <section id="contact">
            <h2>11. Contact</h2>
            <p>
              For privacy or data protection inquiries, write to:{" "}
              <a href="mailto:jujuyconecta@gmail.com">jujuyconecta@gmail.com</a>
            </p>
          </section>
        </article>

        <footer className="mt-10 text-sm text-muted-foreground">
          <p>
            Looking for the{" "}
            <Link className="underline" to="/terminos">
              Terms and Conditions
            </Link>
            ?
          </p>
        </footer>
      </div>
    </Layout>
  );
}

import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";

const sections = [
  { id: "aceptacion", title: "1. Aceptación" },
  { id: "acceso-registro", title: "2. Acceso y registro" },
  { id: "uso-permitido", title: "3. Uso permitido" },
  { id: "informacion-provista", title: "4. Información provista" },
  { id: "privacidad-datos", title: "5. Privacidad y datos personales" },
  { id: "contenido-terceros", title: "6. Contenido de terceros" },
  { id: "limitacion-resp", title: "7. Limitación de responsabilidad" },
  { id: "modificaciones", title: "8. Modificaciones" },
  { id: "jurisdiccion", title: "9. Jurisdicción" },
  { id: "nota", title: "Nota importante (beta)" },
];

export default function TermsAndConditions() {
  const lastUpdated = "24/09/2025"; // TODO: actualizar cuando corresponda

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">📜 Términos y Condiciones – Jujuy Conecta</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Última actualización: <time dateTime="2025-09-24">{lastUpdated}</time>
          </p>
        </header>

        {/* Índice */}
        <nav aria-label="Índice" className="mb-8 border rounded-lg p-4">
          <p className="font-medium mb-2">Contenido</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a className="hover:underline" href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <section id="aceptacion">
            <h2>1. Aceptación</h2>
            <p>
              Al registrarse y utilizar Jujuy Conecta, el usuario acepta estos Términos y Condiciones.
              Si no está de acuerdo, debe abstenerse de usar la aplicación.
            </p>
          </section>

          <section id="acceso-registro">
            <h2>2. Acceso y registro</h2>
            <p>
              Para acceder a ciertas funciones, el usuario debe iniciar sesión con su cuenta de Google.
              La autenticación se realiza únicamente para verificar identidad y permitir el uso del asistente digital.
              Jujuy Conecta no accede a correos electrónicos, contactos ni archivos personales de la cuenta de Google.
            </p>
          </section>

          <section id="uso-permitido">
            <h2>3. Uso permitido</h2>
            <ul>
              <li>Utilizar la aplicación solo con fines informativos, educativos o de consulta.</li>
              <li>No emplear la plataforma para actividades ilícitas, difamatorias o que vulneren derechos de terceros.</li>
              <li>Respetar las normas de convivencia y uso responsable de la información.</li>
            </ul>
          </section>

          <section id="informacion-provista">
            <h2>4. Información provista</h2>
            <ul>
              <li>La información proviene de fuentes públicas y puede no estar siempre actualizada.</li>
              <li>Jujuy Conecta no garantiza exactitud absoluta ni disponibilidad permanente de los servicios.</li>
              <li>La aplicación no reemplaza consultas oficiales, médicas, legales o profesionales.</li>
            </ul>
          </section>

          <section id="privacidad-datos">
            <h2>5. Privacidad y datos personales</h2>
            <ul>
              <li>El único dato requerido es la dirección de correo electrónico vinculada a la cuenta Google.</li>
              <li>Este dato se utiliza exclusivamente para crear el perfil de usuario y registrar su actividad en la app.</li>
              <li>
                No se compartirán datos personales con terceros sin consentimiento previo, salvo obligación legal.
              </li>
              <li>
                El usuario puede solicitar la eliminación de su cuenta y datos escribiendo a{" "}
                <a href="mailto:jujuyconecta@gmail.com">jujuyconecta@gmail.com</a>.
              </li>
            </ul>
          </section>

          <section id="contenido-terceros">
            <h2>6. Contenido de terceros</h2>
            <p>
              Jujuy Conecta puede mostrar información sobre comercios, instituciones, transporte y servicios.
              Dicho contenido es informativo y de carácter público, y no implica asociación ni aval formal.
            </p>
          </section>

          <section id="limitacion-resp">
            <h2>7. Limitación de responsabilidad</h2>
            <p>
              El uso de la aplicación es bajo exclusiva responsabilidad del usuario.
              Jujuy Conecta no se responsabiliza por daños, pérdidas o inconvenientes derivados del uso de la información publicada.
            </p>
          </section>

          <section id="modificaciones">
            <h2>8. Modificaciones</h2>
            <p>
              Jujuy Conecta podrá actualizar estos Términos y Condiciones en cualquier momento.
              Los cambios serán notificados en la aplicación o en el sitio web oficial.
            </p>
          </section>

          <section id="jurisdiccion">
            <h2>9. Jurisdicción</h2>
            <p>
              Estos Términos se rigen por las leyes de la República Argentina. Cualquier controversia será resuelta en los
              tribunales de la Provincia de Jujuy.
            </p>
          </section>

          <section id="nota">
            <h2>📌 Nota importante</h2>
            <p>
              La aplicación se encuentra en versión beta gratuita y puede presentar fallas o limitaciones.
            </p>
          </section>
        </article>

        <footer className="mt-10 text-sm text-muted-foreground">
          <p>
            ¿Buscás nuestra <Link className="underline" to="/privacidad">Política de Privacidad</Link>?
          </p>
        </footer>
      </div>
    </Layout>
  );
}

import { StarLinkButton } from "./components/StarLinkButton";
import { SmokeBackground } from "./components/SmokeBackground";

const links = [
  { href: "https://www.twitch.tv/akira_02777", title: "Twitch" },
  { href: "https://kick.com/akira-027", title: "Kick" },
];

function App() {
  return (
    <>
      <SmokeBackground smokeColor="#8b5cf6" />
      <main className="page">
        <section className="card">
          <img className="avatar" src="/images/Profile.jpg" alt="Foto de perfil de Akira" />
          <h1 className="name">AKIRA</h1>
          <p className="bio">"Uma live de cada vez.. Um passo de cada vez." 💜</p>

          <nav className="links">
            {links.map((link) => (
              <StarLinkButton key={link.title} href={link.href} label={link.title} />
            ))}
          </nav>
        </section>

        <footer className="footer">
          <p>© {new Date().getFullYear()} Akira</p>
          <p>
            <a href="/privacidade.html" className="footer-link">
              Politica de Privacidade
            </a>
          </p>
          <p className="footer-credit">
            Criado por{" "}
            <a
              href="https://instagram.com/singularitypages"
              target="_blank"
              rel="noopener"
              className="footer-credit-link"
            >
              SingularityPages
            </a>
          </p>
        </footer>
      </main>
    </>
  );
}

export default App;

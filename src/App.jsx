import { useEffect, useState, useRef } from "react";
import styles from "./app.module.scss";
import { AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FiAlertCircle, FiExternalLink } from "react-icons/fi";

export function App() {
  const [zip, setZip] = useState("");
  const [zipData, setZipData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  async function getZipInfo() {
    if (zip.length === 0) {
      setError("Insira um cep");
      return;
    }

    if (!/^[0-9]{5}-?[0-9]{3}$/.test(zip)) {
      setError("Insira um cep valido.");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
      if (!response.ok)
        throw new Error(
          "Erro na solicitação. Por favor, tente novamente mais tarde."
        );
      const data = await response.json();
      if (data.erro === true) throw new Error("Cep não econtrado.");
      setZipData(data);
    } catch (error) {
      console.log("Erro na solicitação: ", error);
      setError(error.message);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmitForm(e) {
    e.preventDefault();
    getZipInfo();
    setZip("");
    setZipData(null);
  }

  function handleChange({ target }) {
    if (zip.length === 0) {
      setError(null);
    }
    setZip(target.value);
  }

  return (
    <main className={styles.container}>
      <h1>
        Localiza-se <FaMapMarkerAlt size={50} color="red" />
      </h1>

      <form onSubmit={handleSubmitForm}>
        <div className={styles.formContent}>
          <input
            ref={inputRef}
            type="text"
            value={zip}
            onChange={handleChange}
            placeholder="Digite um Cep"
          />

          <div>
            <button type="submit">
              <AiOutlineSearch size={40} color="#fff" />
            </button>
          </div>
        </div>
        {error && (
          <span className={`${styles.error} ${styles.horizontalShake}`}>
            <FiAlertCircle size={16} />
            {error}
          </span>
        )}
      </form>
      {isLoading && <span className={styles.loading}>Carregando...</span>}

      {zipData && (
        <div
          className={`${styles.addressDetailsContainer} ${styles.slideInFwdCenter}`}
        >
          <h2>
            Cep: <span>{zipData.cep}</span>
          </h2>
          <button onClick={() => setZipData(null)}>
            <AiOutlineClose size={18} color="#fff" title="Fechar" />
          </button>
          <img src={`/images/${zipData.uf}.png`} alt="foto do estado" />
          <div className={styles.addressDetailsContent}>
            <p>
              <span>Cidade:</span>
              {zipData.localidade}({zipData.uf})
            </p>
            {zipData.logradouro && (
              <p>
                <span>Nome da rua:</span>
                <span className={styles.linkAddress}>
                  {zipData.logradouro}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${zipData.logradouro},+${zipData.localidade}`}
                    target="_blank"
                    title={`Ir para ${zipData.logradouro}`}
                  >
                    <FiExternalLink size={16} color="#333" />
                  </a>
                </span>
              </p>
            )}

            {zipData.bairro && (
              <p>
                <span>Bairro:</span>
                {zipData.bairro && zipData.bairro}
              </p>
            )}

            {zipData.complemento && (
              <p>
                <span>Complemento:</span>
                {zipData.complemento}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

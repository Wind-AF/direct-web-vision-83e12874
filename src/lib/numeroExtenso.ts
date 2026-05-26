const unidades = [
  "zero", "um", "dois", "três", "quatro", "cinco",
  "seis", "sete", "oito", "nove", "dez", "onze",
  "doze", "treze", "quatorze", "quinze", "dezesseis",
  "dezessete", "dezoito", "dezenove",
];

const dezenas = [
  "", "", "vinte", "trinta", "quarenta", "cinquenta",
  "sessenta", "setenta", "oitenta", "noventa",
];

const centenas = [
  "", "cento", "duzentos", "trezentos", "quatrocentos",
  "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos",
];

function extensoAteMil(n: number): string {
  if (n < 20) return unidades[n];
  if (n < 100) {
    const d = Math.floor(n / 10);
    const u = n % 10;
    return u === 0 ? dezenas[d] : `${dezenas[d]} e ${unidades[u]}`;
  }
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  if (resto === 0) return centenas[c];
  return `${centenas[c]} e ${extensoAteMil(resto)}`;
}

export function valorPorExtensoReais(n: number): string {
  if (n === 0) return "zero reais";
  const milhares = Math.floor(n / 1000);
  const resto = n % 1000;

  let partes: string[] = [];

  if (milhares > 0) {
    partes.push(`${extensoAteMil(milhares)} mil`);
  }

  if (resto > 0) {
    partes.push(extensoAteMil(resto));
  }

  const extenso = partes.join(" e ");
  return `${extenso} reais`;
}

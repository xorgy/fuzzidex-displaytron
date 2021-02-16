import grapheme_iterator from 'grapheme-iterator';
import {mkgrams} from 'fuzzidex';


const match_accum = (qg, s, depth = 6) => {
  const sn = s.normalize("NFD");
  const snlower = sn.toLowerCase();
  const acc = new Uint8Array(sn.length);
  for (const gram of qg)
    for (let i = 0; i < sn.length; i++)
      if (snlower.substring(i, i + gram.length) === gram)
        for (let j = 0; j < gram.length; j++)
          acc[i + j] = Math.max(acc[i + j], gram.length);

  const graphemes_match = [];
  let b = 0;
  for (const gr of grapheme_iterator(sn)) {
    const gl = gr.length;
    let gacc = 0;
    for (let i = 0; i < gl; i++)
      gacc += acc[b + i];
    graphemes_match.push([gr, ((gacc / gl) / depth)]);
    b += gl;
  }

  const out = [];

  for (const [cg, cr] of graphemes_match) {
    const top = out.pop();
    if (top && top[1] === cr) {
      const [tg, tr] = top;
      out.push([tg + cg, tr])
    } else {
      if (top) out.push(top);
      out.push([cg, cr]);
    }
  }

  return out;
}

export const matchspans = (query_string, result_strings, depth = 6) => {
  const qsn = query_string.normalize("NFD");
  const qg = mkgrams(qsn, depth);
  const rdepth = Math.min(qsn.length, depth);
  return {
    *[Symbol.iterator]() {
      for (const rs of result_strings)
        yield match_accum(qg, rs, rdepth);
    }
  };
}

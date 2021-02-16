declare module "fuzzidex-displaytron" {
  export function matchspans(query_string: string, result_strings: Iterable<string>, depth?: number): Iterable<[string, number][]>;
}

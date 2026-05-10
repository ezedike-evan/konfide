/**
 * `<CorridorPicker />` — UI for selecting a trade corridor (origin →
 * destination + preferred currency). Stub component.
 */

export interface CorridorPickerProps {
  readonly fromCountry: string | null
  readonly toCountry: string | null
  readonly preferredCurrency: string | null
  readonly onChange: (next: {
    fromCountry: string
    toCountry: string
    preferredCurrency: string | null
  }) => void
}

export function CorridorPicker(_props: CorridorPickerProps): null {
  // TODO: country combobox + currency dropdown.
  return null
}

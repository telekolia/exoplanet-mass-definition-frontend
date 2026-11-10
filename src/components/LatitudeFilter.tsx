import { Button, Form } from 'react-bootstrap'
import type { LatitudeRange } from '../modules/telescope'

interface Props {
  range: LatitudeRange
  onChange: (range: LatitudeRange) => void
  onApply: () => void
}

export function LatitudeFilter({ range, onChange, onApply }: Props) {
  return (
    <Form
      className="filter-container"
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
    >
      <div className="filter-title">Широта расположения телескопа</div>
      <div className="range-slider">
        <div className="slider-track" />
        <input
          type="range" min={-90} max={90} step={0.01}
          className="slider-input" aria-label="Минимальная широта"
          value={range.min}
          onChange={(event) => onChange({ ...range, min: Math.min(event.target.valueAsNumber, range.max) })}
        />
        <input
          type="range" min={-90} max={90} step={0.01}
          className="slider-input" aria-label="Максимальная широта"
          value={range.max}
          onChange={(event) => onChange({ ...range, max: Math.max(event.target.valueAsNumber, range.min) })}
        />
      </div>
      <div className="filter-values">
        <span>От {range.min}°</span>
        <span>до {range.max}°</span>
      </div>
      <Button variant="light" type="submit" className="main-button">Применить</Button>
    </Form>
  )
}

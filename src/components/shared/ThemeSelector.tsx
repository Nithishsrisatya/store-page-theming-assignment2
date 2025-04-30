import React from 'react'
import { useThemeStore } from '../../store/themeStore'

const themes = [
  { id: 'default', name: 'Default' },
  { id: 'theme1', name: 'Organ Transplant' },
  { id: 'theme2', name: 'Cosmetic Surgery' },
]

const ThemeSelector: React.FC = () => {
  const { specialty, setSpecialty } = useThemeStore()

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSpecialty(event.target.value as 'default' | 'theme1' | 'theme2')
  }

  return (
    <select value={specialty} onChange={handleChange} className="p-2 rounded border border-gray-300">
      {themes.map((theme) => (
        <option key={theme.id} value={theme.id}>
          {theme.name}
        </option>
      ))}
    </select>
  )
}

export default ThemeSelector

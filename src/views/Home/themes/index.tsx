import React from 'react'
import { useThemeStore } from '../../../store/themeStore'

const themes = [
  { id: 'default', name: 'Default', description: 'Default theme for general use.' },
  { id: 'theme1', name: 'Organ Transplant', description: 'Theme tailored for Organ Transplant specialty.' },
  { id: 'theme2', name: 'Cosmetic Surgery', description: 'Theme tailored for Cosmetic Surgery specialty.' },
]

const ThemesPage: React.FC = () => {
  const { specialty, setSpecialty } = useThemeStore()

  const handleSelect = (id: string) => {
    setSpecialty(id as 'default' | 'theme1' | 'theme2')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Select a Theme</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`border rounded p-4 cursor-pointer ${specialty === theme.id ? 'border-primary' : 'border-gray-300'}`}
            onClick={() => handleSelect(theme.id)}
          >
            <h2 className="text-xl font-semibold mb-2">{theme.name}</h2>
            <p className="text-gray-600">{theme.description}</p>
            {specialty === theme.id && <p className="text-green-600 mt-2 font-semibold">Selected</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ThemesPage

export function TestStyles() {
  const styles = {
    color: 'red',
    fontSize: '24px',
    fontWeight: 'bold',
    padding: '16px',
  }

  return (
    <>
      <div style={styles}>
        Inline Styles (Should be red, large, and bold)
      </div>
      <div className="text-blue-500 text-2xl font-bold p-4">
        Tailwind Styles (Should be blue, large, and bold)
      </div>
    </>
  )
} 
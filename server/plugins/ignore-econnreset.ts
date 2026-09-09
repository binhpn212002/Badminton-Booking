export default defineNitroPlugin(() => {
  process.on('unhandledRejection', (reason) => {
    const err = reason as { code?: string; message?: string } | null
    if (err?.code === 'ECONNRESET' || err?.message?.includes('ECONNRESET')) {
      return
    }
  })
})

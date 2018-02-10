import React from 'react'
import { Route } from 'react-router-dom'

export default ({ component: C, props: childProps, ...rest }) => (
  <Route {...rest} render={routerComponentProps => <C {...routerComponentProps} {...childProps} />} />
)

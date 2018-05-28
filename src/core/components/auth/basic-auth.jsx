import React from "react"
import PropTypes from "prop-types"
import ImPropTypes from "react-immutable-proptypes"

export default class BasicAuth extends React.Component {
  static propTypes = {
    authorized: PropTypes.object,
    getComponent: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    authSelectors: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    let { schema, name, authSelectors } = this.props
    let authConfigs = authSelectors.getConfigs() || {}
    let username = this.getValue().username || authConfigs.username || ""
    let password = authConfigs.password || ""

    this.state = {
      name: name,
      schema: schema,
      value: !username ? {} : {
        username: username,
        password: password
      }
    }

    this.onChange({
      target: {
        value: username,
        name: "username"
      }
    })

    this.onChange({
      target: {
        value: password,
        name: "password"
      }
    })
  }

  getValue () {
    let { authorized, name } = this.props

    return authorized && authorized.getIn([name, "value"]) || {}
  }

  onChange =(e) => {
    let { onChange } = this.props
    let { value, name } = e.target

    let newValue = this.state.value
    newValue[name] = value

    this.setState({ value: newValue })

    onChange(this.state)
  }

  render() {
    let { schema, getComponent, name, errSelectors } = this.props
    const Input = getComponent("Input")
    const Row = getComponent("Row")
    const Col = getComponent("Col")
    const AuthError = getComponent("authError")
    const JumpToPath = getComponent("JumpToPath", true)
    const Markdown = getComponent( "Markdown" )
    let username = this.getValue().username
    let errors = errSelectors.allErrors().filter( err => err.get("authId") === name)

    return (
      <div>
        <h4>Basic authorization<JumpToPath path={[ "securityDefinitions", name ]} /></h4>
        { username && <h6>Authorized</h6> }
        <Row>
          <Markdown source={ schema.get("description") } />
        </Row>
        <Row>
          <label>Username:</label>
          {
            username
              ? <code> { this.state.value.username } </code>
              : <Col>
                  <Input
                    type="text"
                    required="required"
                    value={ this.state.value.username }
                    name="username"
                    onChange={ this.onChange }/>
                </Col>
          }
        </Row>
        <Row>
          <label>Password:</label>
            {
              username
                ? <code> ****** </code>
                : <Col>
                    <Input
                      type="password"
                      required="required"
                      value={ this.state.value.password }
                      name="password"
                      onChange={ this.onChange }/>
                  </Col>
            }
        </Row>
        {
          errors.valueSeq().map( (error, key) => {
            return <AuthError error={ error }
                              key={ key }/>
          } )
        }
      </div>
    )
  }

  static propTypes = {
    name: PropTypes.string.isRequired,
    errSelectors: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    schema: ImPropTypes.map,
    authorized: ImPropTypes.map
  }
}
